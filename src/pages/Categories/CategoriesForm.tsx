import { useCallback, useEffect, useState } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { useForm, SubmitHandler } from 'react-hook-form';
import { ICategory, ICategories } from '../../types/Category';
import { toast } from 'react-toastify';
import { api } from '../../api/api';
import { Helmet } from 'react-helmet-async';

export function CategoriesForm() {
  const { id: categoryId } = useParams<{ [key: string]: '' }>();

  const { pathname } = useLocation();

  const navigate = useNavigate();

  const {
    reset,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ICategory>({
    defaultValues: {} as ICategory,
    mode: 'onChange',
  });

  const [{ category, loading }, fetch] = useState<ICategories<ICategory>>({
    category: {} as ICategory,
    loading: false,
    error: '',
  });

  const fetchApi = useCallback(async (categoryId: string) => {
    await api.get(`/categories/${categoryId}`).then(async ({ data }) => {
      fetch({
        error: '',
        category: await data,
        loading: false,
      });
      reset(await data);
    });
  }, []);

  useEffect(() => {
    if (categoryId) fetchApi(categoryId);
  }, [categoryId]);

  useEffect(() => {
    const url = pathname.split('/');
    if (category.id && url[url.length - 1] === 'new') {
      navigate(`/categories/${category.id}/edit`);
    }
  }, [category]);

  const onSubmit: SubmitHandler<ICategory> = async data => {
    const { description, keywords, name, position } = data;
    const newData = { description, keywords, name, position: Number(position) };

    const promiseCategory = (async () => {
      if (data.id) {
        await api
          .put(`/categories/${categoryId}`, newData)
          .then(async ({ data }) => fetchApi(data.id));
      } else {
        await api
          .post(`/categories`, newData)
          .then(async ({ data }) => fetchApi(data.id));
      }
    })();

    toast.promise(promiseCategory, {
      pending: 'Um momento por favor...',
      success: 'Dados salvos com sucesso!',
      error: 'Algo deu errado, tente novamente!',
    });
  };

  return (
    <div className="content">
      <div className="help-buttons-flex">
        <h1>{category?.name}</h1>
        <span>
          <Link to="/categories" className="btn btn-default">
            voltar <i className="fa-solid fa-undo"></i>
          </Link>
          <button
            form="category"
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            salvar <i className="fa-solid fa-pen-to-square"></i>
          </button>
        </span>
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="form-style form-category"
        id="category"
      >
        <div className="form-input flex-4">
          <label htmlFor="name">Nome *</label>
          <input
            type="text"
            {...register('name', { required: 'Campo obrigatório!' })}
            className={errors.name && 'input-invalid'}
          />
          <small>{errors.name && errors.name.message}</small>
        </div>
        <div className="form-input flex-1">
          <label htmlFor="name">Posição *</label>
          <input
            type="text"
            {...register('position', { required: false })}
            className={errors.position && 'input-invalid'}
          />
          <small>{errors.position && errors.position.message}</small>
        </div>

        <div className="form-input flex-7">
          <label htmlFor="description">Keywords</label>
          <input
            type="keywords"
            {...register('keywords', {
              required: false,
            })}
            className={errors.keywords && 'input-invalid'}
          />
          <small>{errors.keywords && 'Campo obrigatório!'}</small>
        </div>
        <div className="form-input flex-7">
          <label htmlFor="description">Descrição</label>
          <input
            type="description"
            {...register('description', {
              required: false,
            })}
            className={errors.description && 'input-invalid'}
          />
          <small>{errors.description && 'Campo obrigatório!'}</small>
        </div>
      </form>
      <Helmet>
        <title>Categorias - Cadastrar/Editar</title>
      </Helmet>
    </div>
  );
}
