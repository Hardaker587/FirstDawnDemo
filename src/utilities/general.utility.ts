export const randomEnumValue = <T>(enumeration: T): T[keyof T] => {
  const values = Object.keys(enumeration);
  const enumKey = values[Math.floor(Math.random() * values.length)];
  const randomEnumValue = enumeration[enumKey];
  return randomEnumValue;
};
