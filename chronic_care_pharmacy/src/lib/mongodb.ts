import fs from 'fs';
import path from 'path';

const DATA_FILE_SIBLING = path.join(process.cwd(), '..', 'chronicare-sync', 'data', 'prescriptions.json');
const DATA_FILE_LOCAL = path.join(process.cwd(), 'data', 'prescriptions.json');

function ensureDir(filePath: string) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function getPrescriptionsFile(): string {
    const siblingDir = path.dirname(DATA_FILE_SIBLING);
    if (fs.existsSync(siblingDir)) {
        return DATA_FILE_SIBLING;
    }
    return DATA_FILE_LOCAL;
}

function readPrescriptions(): any[] {
    const file = getPrescriptionsFile();
    if (!fs.existsSync(file)) {
        return [];
    }
    try {
        const raw = fs.readFileSync(file, 'utf-8');
        return JSON.parse(raw);
    } catch (e) {
        console.error('Failed to parse prescriptions JSON:', e);
        return [];
    }
}

function writePrescriptions(data: any[]) {
    const file = getPrescriptionsFile();
    try {
        ensureDir(file);
        fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
        console.error('Failed to write prescriptions JSON:', e);
    }
}

export async function getDb() {
    return {
        collection(name: string) {
            if (name !== PRESCRIPTIONS_COLLECTION) {
                throw new Error(`Collection ${name} is not supported in the mock DB`);
            }
            return {
                find(query: any = {}) {
                    let list = readPrescriptions();
                    
                    if (query.status) {
                        list = list.filter((p: any) => p.status === query.status);
                    }
                    
                    if (query.patientId) {
                        if (query.patientId.$regex) {
                            const regex = query.patientId.$regex;
                            list = list.filter((p: any) => regex.test(p.patientId));
                        } else {
                            list = list.filter((p: any) => p.patientId === query.patientId);
                        }
                    }
                    
                    return {
                        sort(sortObj: any = {}) {
                            if (sortObj.createdAt === -1) {
                                list.sort((a: any, b: any) => {
                                    const tA = new Date(a.createdAt || 0).getTime();
                                    const tB = new Date(b.createdAt || 0).getTime();
                                    return tB - tA;
                                });
                            }
                            return this;
                        },
                        async toArray() {
                            return list.map((p: any) => {
                                const idStr = p._id || p.prescriptionId || `rx-${Date.now()}`;
                                return {
                                    ...p,
                                    _id: idStr
                                };
                            });
                        }
                    };
                },
                async findOneAndUpdate(filter: any, update: any, options?: any) {
                    const list = readPrescriptions();
                    const filterId = filter._id ? filter._id.toString() : null;
                    const filterRxId = filter.prescriptionId;
                    
                    const index = list.findIndex((p: any) => {
                        if (filterId) {
                            const pId = p._id ? p._id.toString() : p.prescriptionId;
                            return pId === filterId;
                        }
                        if (filterRxId) {
                            return p.prescriptionId === filterRxId;
                        }
                        return false;
                    });
                    
                    if (index === -1) {
                        return null;
                    }
                    
                    if (update.$set) {
                        list[index] = {
                            ...list[index],
                            ...update.$set,
                            updatedAt: update.$set.updatedAt || new Date().toISOString()
                        };
                    }
                    
                    if (!list[index]._id) {
                        list[index]._id = list[index].prescriptionId;
                    }
                    
                    writePrescriptions(list);
                    return list[index];
                }
            };
        }
    };
}

export const PRESCRIPTIONS_COLLECTION = 'prescriptions';

// Export dummy client promise for backward compatibility
const dummyPromise = Promise.resolve({}) as any;
export default dummyPromise;
