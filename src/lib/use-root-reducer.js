/**
* Based on https://github.com/ahungrynoob/use-root-reducer/blob/f5c366270cab9091bba0e13f4744630378daf00e/src/index.ts
*
* MIT License
*
* Copyright (c) 2019 dxd
*
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in all
* copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
* SOFTWARE.
*/

import { useCallback } from "react";

export default function useRootReducer(reducerMap) {
    if (!reducerMap) {
        throw new Error("useRootReducer: please pass useReducers argv");
    }
    const rootStateKeys = Object.keys(reducerMap);
    const rootState = rootStateKeys.reduce(
        (lastState, key) => ({
            ...lastState,
            [key]: reducerMap[key][0]
        }),
        {}
    );

    const useRootReducerDispatch = useCallback(action => {
        rootStateKeys.forEach(key => {
            const fn = reducerMap[key][1];
            fn(action);
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, rootStateKeys);

    return [rootState, useRootReducerDispatch];
}
