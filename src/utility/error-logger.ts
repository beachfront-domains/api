


/// export

export default (data: any, description?: string) => {
  if (!description)
    description = "ERROR";

  console.group(description);
  console.error(data);
  console.groupEnd();
}
