const paginationResult = (count: number, skip: number, limit: number) => {
  const totalPages = Math.ceil(count / limit);

  return {
    totalItems: count,
    totalPages,
    currentPage: Math.ceil(skip / limit) + 1,
    itemsPerPage: limit,
  };
};

export default paginationResult;
