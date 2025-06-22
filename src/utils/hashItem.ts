import bcrypt from "bcrypt";
const hashItem = (item: any) => {
  const hashedItem = bcrypt.hashSync(item, 10);

  return hashedItem;
};

export default hashItem;
