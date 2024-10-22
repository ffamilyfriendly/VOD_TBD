#[macro_export]
macro_rules! has_permission {
    ($token:ident, $permission:ident) => {
        $token.get_perms().has_or_err(&crate::managers::user_manager::UserPermissions::$permission)?
    };
}

// stmt.query_map([], |row| Tag::try_from(row))?.collect::<Result<Vec<Tag>,_>>()?;

#[macro_export]
macro_rules! row_to_vec {
    ($stmt:expr, $type:ident) => {
        $stmt.query_map([], |row| $type::try_from(row))?.collect::<Result<Vec<$type>, _>>()?
    };

    ($stmt:expr, $values:expr, $type:ident) => {
        $stmt.query_map($values, |row| $type::try_from(row))?.collect::<Result<Vec<$type>, _>>()?
    };
}