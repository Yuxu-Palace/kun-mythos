import { isArray, isObject } from './verify';

type KeyType = string | number;

type InputType = KeyType | Record<KeyType, any> | null | undefined | symbol | InputType[];

function objectHandler(obj: Record<KeyType, any>, names: KeyType[], set: Set<InputType>) {
  Object.entries(obj).forEach(([key, value]) => {
    if (!value || set.has(key)) return;
    set.add(key);
    names.push(key);
  });
}

function arrayHandler(arr: InputType[], names: KeyType[], set: Set<InputType>) {
  /**
   * 传入 names 为了减少扩展数组引来的开销
   *
   * 如果不传的话内部会出现 tempArr.push(...arrayHander(item)) 或者 tempArr.push(...objectHander(item))
   *
   * 扩展运算符会再次遍历数组导致额外开销
   */
  arr.forEach((item) => {
    if (!item || set.has(item)) return;
    set.add(item);

    // 数组处理
    if (isArray(item)) {
      return arrayHandler(item, names, set);
    }

    // 对象处理
    if (isObject(item)) {
      return objectHandler(item, names, set);
    }

    // 普通对象
    names.push(String(item));
  });
  return names;
}

/**
 * 根据输入数据生成 className 字符串
 */
export function classnames(...input: InputType[]) {
  /**
   * set 处理循环依赖和重复数据
   *
   * 以 classnames 为单位隔离循环依赖, 和资源释放
   *
   * 对象不存在循环依赖, 因为不会递归对象, 而是直接判断 value 的布尔值
   */
  return arrayHandler(input, [], new Set([input])).join(' ');
}

export const cn = classnames;
