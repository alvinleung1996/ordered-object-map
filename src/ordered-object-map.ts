/**
 * @license
 *
 * Copyright (c) 2019 Leung Ho Pan Alvin. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as Immutable from '@alvinleung1996/immutable';
import * as ObjectMap from '@alvinleung1996/object-map';



export interface OrderedObjectMap<T> {
    readonly map: ObjectMap.ObjectMap<T>;
    readonly order: ReadonlyArray<string>;
}

export type OrderedObjetMapItem<T extends OrderedObjectMap<any>> = T extends OrderedObjectMap<infer U> ? U : never;



export const EMPTY: OrderedObjectMap<never> = Object.freeze({
    map: ObjectMap.EMPTY,
    order: Object.freeze([])
});



export const from: {
    <T extends { id: string; }>(array: ReadonlyArray<T>): OrderedObjectMap<T>;
    <T>(array: ReadonlyArray<T>, key: (val: T) => string): OrderedObjectMap<T>
} = <T>(array: ReadonlyArray<T>, key?: (val: T) => string) => {
    if (key === undefined) {
        key = (val: any) => {
            if (val.key === undefined) throw new TypeError('Missing key property');
            return val.key;
        };
    }

    return {
        map: ObjectMap.from(array, key),
        order: array.map(item => key!(item))
    };
};



export const set = <T>(
    obj: OrderedObjectMap<T>,
    key: string,
    val: T
) => {
    const exist = obj.map[key] !== undefined;

    obj = Immutable.setWith(obj, 'map', map =>
        Immutable.set(map, key, val)
    );

    if (!exist) {
        obj = Immutable.setWith(obj, 'order', order =>
            [
                ...order,
                key
            ]
        );
    }

    return obj;
};

export const setWith = <T>(
    obj: OrderedObjectMap<T>,
    key: string,
    getVal: (val: T) => T
) => set(obj, key, getVal(obj.map[key]));



export const remove = <T>(
    obj: OrderedObjectMap<T>,
    key: string
) => {
    const index = obj.order.findIndex(item => item === key);
    if (index >= 0) {
        obj = Immutable.merge(obj, {
            map: ObjectMap.remove(obj.map, key),
            order: Immutable.removeItem(obj.order, index)
        });
    }
    return obj;
};



export const migrate = <T>(
    oldMap: OrderedObjectMap<T>,
    newMap: OrderedObjectMap<T>,
    merger?: (oldVal: T, newVal: T) => T
) => {
    oldMap = Immutable.set(oldMap, 'map', ObjectMap.migrate(
        oldMap.map,
        newMap.map,
        merger
    ));

    let oldMapOrder = oldMap.order;
    let newMapOrder = newMap.order;
    for (let i = 0; i < Math.min(oldMapOrder.length, newMapOrder.length); ++i) {
        oldMapOrder = Immutable.set(oldMapOrder, i, newMapOrder[i]);
    }
    if (oldMapOrder.length < newMapOrder.length) {
        oldMapOrder = [
            ...oldMapOrder,
            ...newMapOrder.slice(oldMapOrder.length)
        ];
    } else if (oldMapOrder.length > newMapOrder.length) {
        oldMapOrder = oldMapOrder.slice(0, newMapOrder.length);
    }
    return Immutable.set(oldMap, 'order', oldMapOrder);
};



export const map = <T>(
    valMap: OrderedObjectMap<T>,
    mapper: (val: T) => T
): OrderedObjectMap<T> => {

    return Immutable.setWith(valMap, 'map', map => ObjectMap.map(map, mapper));

};
