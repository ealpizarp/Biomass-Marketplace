/* eslint-disable react/jsx-key */
import React, { Component } from 'react';
import { Redirect } from "react-router-dom";
import ArticuloC from '../Components/ArticulosC';
import { Button, Form } from 'react-bootstrap'
import { axiosInstance } from '../Config';

export default class Compras extends Component {
    constructor(props) {
        super(props);
        this.state = {
            productos: [],
            precioTotal: 0,
            ordenPublica: false
        }
        this.handleFinalizarCompra = this.handleFinalizarCompra.bind(this);
        this.handleChangeOrdenPublica = this.handleChangeOrdenPublica.bind(this)
    }

    handleFinalizarCompra(event) {
        event.preventDefault();
        console.log("Orden es publica: ", this.state.ordenPublica)
        let datos = {
            user: localStorage.getItem("username"),
            items: this.state.productos,
            total: this.state.precioTotal,
            ordenPublica: this.state.ordenPublica
        }
        axiosInstance.post("finishShopping", datos)
            .then(response => {
                console.log(response.data);
            })
            .catch(error => {
                console.log(error);
            });

        window.location.reload(false);
    }

    getProductInfo(id) {
        return axiosInstance.get("producto/" + id)
    }

    handleChangeOrdenPublica(event) {
        console.log(!this.state.ordenPublica)
        this.setState({ordenPublica: !this.state.ordenPublica})
    }

    componentDidMount() {
        var cart = []
        var promises = []
        var products = []
        var total = 0
        axiosInstance.get("getCart/" + localStorage.getItem("username"))
            .then(response => {

                cart = response.data
                for (var key in cart) {
                    var value = cart[key]
                    //console.log(key, value)
                    promises.push(this.getProductInfo(key))
                }
                Promise.all(promises).then((values) => {
                    values.map(value => (
                        value.data["cantidad"] = cart[value.data.id_producto],
                        products.push(value.data),
                        total += parseFloat(value.data.precio_producto) * value.data.cantidad
                    ))
                    console.log("PRODUCTOS EN CARRO: ", products, "Total: ", total)
                    this.setState({ productos: products, precioTotal: total })
                })
            })
            .catch(error => {

            })
    }

    render() {
        const productos = this.state.productos;
        const total = this.state.precioTotal;
        return (
            <div>
                {
                    productos.map(producto => (
                        <ArticuloC
                            {...producto}>
                        </ArticuloC>
                    ))}
                <label id='total_Carrito'>Total a pagar: ¢{total}</label>
                
                <Form.Group controlId="formBasicCheckbox">
                    <Form.Check type="checkbox" label="Hacer orden publica" onChange={this.handleChangeOrdenPublica} />
                </Form.Group>

                <Form onSubmit={this.handleFinalizarCompra}>
                <Button variant="primary" type="submit">
                    Finalizar compra
                    </Button>
                </Form>
            </div >
        );
    }
}