import { User } from "../models/usersModel";
import { Group } from "../models/groupsModel";
import { Page } from "../models/pagesModel";
import { TServiceResult } from "../types/serviceResult";
import { TGroup, TPage, TUser } from "../types";

const searchService = async (
  type: "users" | "groups" | "pages",
  searchTerm: string,
  paginationData: { limit: number; skip: number }
): Promise<TServiceResult<TUser[] | TGroup[] | TPage[]>> => {
  let searchData = [];
  const { limit, skip } = paginationData;
  switch (type) {
    case "users":
      searchData = await User.find({
        username: { $regex: searchTerm, $options: "i" },
      })
        .select("username profilePicture age gender")
        .limit(limit)
        .skip(skip);
      break;
    case "groups":
      searchData = await Group.find({
        groupName: { $regex: searchTerm, $options: "i" },
      })
        .select("groupName groupCover")
        .limit(limit)
        .skip(skip);
      break;
    case "pages":
      searchData = await Page.find({
        pageName: { $regex: searchTerm, $options: "i" },
      })
        .select("pageName pageCover")
        .limit(limit)
        .skip(skip);
      break;
  }
  return { data: searchData, type: "success" };
};

export default {
  searchService,
};
