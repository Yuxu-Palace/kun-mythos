import { isArray, isObject, isSymbol } from './verify';

type KeyType = string | number;

type InputType = KeyType | Record<KeyType, any> | null | undefined | InputType[];

function objectHandler(obj: Record<KeyType, any>, names: KeyType[], set: Set<InputType>) {
  const entries = Object.entries(obj);
  for (let i = 0; i < entries.length; ++i) {
    const [key, value] = entries[i];
    if (!value || set.has(key) || isSymbol(key)) continue;
    set.add(key);
    names.push(key);
  }
}

function arrayHandler(arr: InputType[], names: KeyType[], set: Set<InputType>) {
  /**
   * 传入 names 为了减少扩展数组引来的开销
   *
   * 如果不传的话内部会出现 tempArr.push(...arrayHander(item)) 或者 tempArr.push(...objectHander(item))
   *
   * 扩展运算符会再次遍历数组导致额外开销
   */
  for (let i = 0; i < arr.length; ++i) {
    const item = arr[i];
    if (!item || set.has(item) || isSymbol(item)) continue;
    set.add(item);

    // 数组处理
    if (isArray(item)) {
      arrayHandler(item, names, set);
      continue;
    }

    // 对象处理
    if (isObject(item)) {
      objectHandler(item, names, set);
      continue;
    }

    // 普通值
    names.push(String(item));
  }
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
   * 对象不会导致循环依赖问题, 因为只处理对象的键, 不递归处理值
   */
  return arrayHandler(input, [], new Set([input])).join(' ');
}

export const cn = classnames;
