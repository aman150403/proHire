async function filterAndPaginate({
    model,
    query,
    searchableFields = [],
    defaultSort  = 'createdAt' }) {
    try {
        const { page = 1, limit = 10, sort = defaultSort, ...filters } = query;

        const skip = (Number(page) - 1) * Number(limit);

        const queyrObj = {};

        searchableFields.forEach((field) => {
            if (filters[field]) {
                queyrObj[field] = new RegExp(filters[field], 'i')
            }
        })

        const total = await model.countDocuments(queyrObj);

        const result = await model
            .find(queyrObj)
            .skip(skip)
            .limit(Number(limit))
            .sort({ [sort]: -1 })

        return {
            success: true,
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / limit),
            data
        };

    } catch (error) {
        return {
            message: 'Something went wrong',
            success: false,
            error: error.message
        }
    }

}

export { filterAndPaginate }