import { useCallback, useMemo, useState } from 'react';
import api from '../api/api';
import {
  CustomerList,
  Customers,
  CustomresContextData,
} from '../context/CustomersContext';

export const useCustomer = (): CustomresContextData => {
  const [customers, setCustomers] = useState<Customers>({} as Customers);
  const [customer, setCustomer] = useState<CustomerList>({} as CustomerList);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCustomers = useCallback(async (): Promise<void> => {
    await api
      .get('/customers')
      .then(async res => setCustomers(await res.data))
      .catch(err => {
        const { message } = err.toJSON();
        setError(`Não foi possivel carregar a lista! -> ${message}`);
      })
      .finally(() => setLoading(false));
  }, [setCustomers, setLoading]);

  const fetchFindCustomer = useCallback(
    async (id: string): Promise<void> => {
      if (id) {
        await api
          .get(`/customers/${id}`)
          .then(async res => setCustomer(await res.data))
          .catch(err => {
            const { message } = err.toJSON();
            setError(`Não foi possivel carregar a lista! -> ${message}`);
          })
          .finally(() => setLoading(false));
      } else {
        setCustomer({} as CustomerList);
        setLoading(false);
      }
    },
    [setCustomer, setLoading],
  );

  const addCustomer = useCallback(
    async (postCustomer: CustomerList): Promise<void> => {
      await api
        .post('/customers', postCustomer)
        .finally(() => setLoading(false))
        .then(async res => setCustomer(await res.data))
        .catch(err => {
          const { message, request } = err;
          if (request) {
            const message2 = JSON.parse(request.response).message;
            setError(`${message}, ${message2}`);
          }
          // console.log('request: %O', JSON.parse(err.request.response).message);
        });
    },
    [setCustomer, setLoading],
  );

  const editCustomer = useCallback(
    async (id, putCustomer): Promise<void> => {
      await api
        .put(`/customers/${id}`, putCustomer)
        .then(async res => {
          setCustomer(await res.data);
        })
        .catch(err => {
          const { message } = err.toJSON();
          setError(`${message}`);
        })
        .finally(() => setLoading(false));
    },
    [setCustomer, setLoading],
  );

  const delCustomer = useCallback(
    async (id: string): Promise<void> => {
      if (!confirm('Deseja realmente excluir?')) return;

      await api
        .delete(`/customers/${id}`)
        .then(async () => {
          const newCustomers = customers.data.filter(item => item.id !== id);
          setCustomers({ ...customers, ...{ ['data']: newCustomers } });
        })
        .catch(err => {
          const { message } = err.toJSON();
          setError(`${message}`);
        })
        .finally(() => setLoading(false));
    },
    [customers, setCustomers, setLoading],
  );

  return useMemo(
    () => ({
      error,
      loading,
      customers,
      customer,
      fetchCustomers,
      fetchFindCustomer,
      addCustomer,
      editCustomer,
      delCustomer,
    }),
    [
      error,
      loading,
      customers,
      customer,
      fetchCustomers,
      fetchFindCustomer,
      addCustomer,
      editCustomer,
      delCustomer,
    ],
  );
};
