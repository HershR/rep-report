export function toUpperCase(str: string | undefined) {
  if (!!str)
    return str
      .split(/[\s]/)
      .map((word, index) => {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(" ");
  return "";
}

export function removeHTML(htmlString: string | undefined) {
  if (!!htmlString) {
    let text = htmlString.replace(/<[^>]*>/g, ""); // Remove HTML tags
    text = text.replace(/&nbsp;/g, " "); // Replace &nbsp; with a space
    return text;
  }
  return "";
}

export default [toUpperCase, removeHTML];
