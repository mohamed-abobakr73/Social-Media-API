const paginationQuery = (query: { limit?: string; page?: string }) => {
  const limit = parseInt(query.limit || "10", 10);
  const page = parseInt(query.page || "1", 10);
  const skip = (page - 1) * limit;

  return { limit, page, skip };
};

export default paginationQuery;
