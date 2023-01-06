import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import qs from 'qs';
import { Link, useNavigate } from 'react-router-dom';

import Categories from "../components/Categories";
import PizzaBlock from "../components/PizzaBlock";
import PizzaSkeleton from "../components/SkeletonPizza";
import { Sort, list } from "../components/Sort";


import { setCategoryId, setCurrentPage, setFilters } from '../redux/slices/filterSlice';
import { setItems, fetchPizzas } from '../redux/slices/pizzaSlice';

import Pagination from '../components/Pagination';
import { AppContext } from '../App';


const Home = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();


    const { items, status } = useSelector((state) => state.pizza);
    const { categoryId, sort, currentPage } = useSelector((state) => state.filter);

    const onChangeCategory = (id) => {
        dispatch(setCategoryId(id));
    }
    const onChangePage = (num) => {
        dispatch(setCurrentPage(num))
    }

    const { searchValue } = React.useContext(AppContext);

    // async action (pizzaSlice)
    const getPizzas = async () => {
        const order = sort.sortProp.includes('-') ? 'asc' : 'desc';
        const sortBy = sort.sortProp.replace('-', '');
        const category = categoryId > 0 ? `category=${categoryId}` : null;
        const search = searchValue ? `search=${searchValue}` : null;
        dispatch(fetchPizzas({
            order,
            sortBy,
            category,
            search,
            currentPage,
        }))
        window.scrollTo(0, 0);
    }
    React.useEffect(() => {
        getPizzas();
    }, [categoryId, sort.sortProp, searchValue, currentPage]);

    React.useEffect(() => {
        if (window.location.search) {
            const params = qs.parse(window.location.search.substring(1));
            const sort = list.find((obj) => obj.sortProp === params.sortProp);
            dispatch(
                setFilters({
                    ...params,
                    sort,
                })
            )
        }
    }, [])

    React.useEffect(() => {

    }, [categoryId, sort.sortProp, searchValue, currentPage])

    React.useEffect(() => {
        const queryString = qs.stringify({
            sortProp: sort.sortProp,
            categoryId,
            currentPage,
        })
        navigate(`?${queryString}`)
    }, [categoryId, sort.sortProp, searchValue, currentPage])

    const pizzas = items.map((item, index) => <Link to={`/pizza/${item.id}`}><PizzaBlock key={item.title + index} {...item} /></Link>)
    const skeletons = [... new Array(4)].map((name, index) => <PizzaSkeleton key={index} />)

    return (
        <>
            <div className="content__top">
                <Categories value={categoryId} onChangeCategory={(id) => onChangeCategory(id)} />
                <Sort />
            </div>
            <h2 className="content__title">{
                searchValue.length ? `Searching for ${searchValue}` : 'All pizzas'
            }</h2>
            {
                status === 'error' ? (
                    <div className="content__error-info">
                        <h2>Oops...</h2>
                        <p>Unfortunantly, failed to get a pizza.. You can try again later!</p>
                    </div>
                ) : (
                    <div className="content__items">
                        {
                            status === 'loading' ? skeletons : pizzas
                        }
                    </div>
                )
            }

            <Pagination currentPage={currentPage} onChangePage={onChangePage} />
        </>
    );
}

export default Home;