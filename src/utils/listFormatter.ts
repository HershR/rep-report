interface List {
  id: string | number;
  empty?: boolean;
  [key: string]: any;
}
interface FormatedList {
  id: string;
  empty: boolean;
}
export const formatList = <T extends List>(
  data: T[] = [],
  numColumns: number
) => {
  if (data.length === 0) {
    return [];
  }
  const formattedData: (FormatedList & T)[] = data.map((x) => {
    return { ...x, id: x.id.toString(), empty: false };
  });
  const numberOfFullRows = Math.floor(data.length / numColumns);
  let numberOfElementsLastRow = data.length - numberOfFullRows * numColumns;
  while (
    numberOfElementsLastRow !== numColumns &&
    numberOfElementsLastRow !== 0
  ) {
    const emptyObj = {
      ...data[0],
      id: `blank-${numberOfElementsLastRow}`,
      empty: true,
    };
    formattedData.push(emptyObj);
    numberOfElementsLastRow++;
  }

  return formattedData;
};
