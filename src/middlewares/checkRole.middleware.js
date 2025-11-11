export const checkRole = (...allowedRoles) => {
    return(req, res, next) => {
        const userRole = req.user?.role

        if(!allowedRoles.includes(userRole)){
            return res.status(400).json({
                message: 'Access denied: Insufficient role',
                success: false
            })
        }

        next();
    }
}