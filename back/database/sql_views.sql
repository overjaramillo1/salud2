create or replace view v_users as
select users.*, 
	coalesce(roles.id,'') as role_id, 
	coalesce(roles.name,'') as role_name, 
	IF(users.status=1, 'Activo', 'Inactivo') as status_name,
	coalesce(users.last_date_connection,'') AS last_connection
from users
left join model_has_roles on users.id = model_has_roles.model_id
left join roles on roles.id = model_has_roles.role_id;
