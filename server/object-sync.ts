import { InterfaceType } from "typescript"
import BaseSyncHost from './base-sync'

interface ObjectSyncServerEvents {
    sync_object_update: () => void;
    sync_object_set: () => void
}

export class ObjectSyncHost<V> extends BaseSyncHost {
    data: V

    constructor(def: V) {
        this.data = def
    }

    update() {
        throw 'not implemented'
    }

    set() {
        throw 'not implemented'
    }
}