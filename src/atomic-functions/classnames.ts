import { isArray, isObject } from './verify';

type KeyType = string | number;

type InputType = KeyType | Record<KeyType, any> | InputType[];

function objectHandler(obj: Record<KeyType, any>, names: KeyType[]) {
  Object.entries(obj).forEach(([key, value]) => value && names.push(key));
}

function arrayHandler(arr: InputType[], names: KeyType[]) {
  /**
   * 传入 names 为了减少扩展数组引来的开销
   *
   * 如果不传的话内部会出现 tempArr.push(...arrayHander(item)) 或者 tempArr.push(...objectHander(item))
   *
   * 扩展运算符会再次遍历数组导致额外开销
   */
  arr.forEach((item) => {
    if (isArray(item)) {
      return arrayHandler(item, names);
    } else if (isObject(item)) {
      return objectHandler(item, names);
    } else if (item) {
      names.push(String(item));
    }
  });
  return names;
}

/**
 * 根据输入数据生成 className 字符串
 */
export function classnames(...input: InputType[]) {
  return arrayHandler(input, []).join(' ');
}

export const cn = classnames;
