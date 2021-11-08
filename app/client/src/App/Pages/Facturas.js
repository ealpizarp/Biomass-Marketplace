/* eslint-disable react/jsx-key */
import React, { Component } from 'react';
import { Redirect } from "react-router-dom";
import FacturaC from '../Components/FacturaC';
import { Button, Form } from 'react-bootstrap'
import { axiosInstance } from '../Config';

export default class Facturas extends Component {
    constructor(props) {
        super(props);
        this.state = {
            facturas: []
        }
    }

    getUserInfo(id) {
        return axiosInstance.get("user/" + id)
    }

    componentDidMount() {
        var Facturas = []
        // Si el parametro de username existe se usa este para buscar las facturas publicas de dicho usuario
        // En otro caso se consiguen todas las facturas del usuario logeado
        try {
            axiosInstance.get("/user/public/orders/" + this.props.location.state.username)
                .then(response => {
                    Facturas = response.data
                    console.log(Facturas);
                    this.setState({ facturas: Facturas })
                })
                .catch(error => {
                    console.log(error);
                })
        } catch (e) {
            axiosInstance.get("getBills/" + localStorage.getItem("username"))
                .then(response => {
                    Facturas = response.data
                    console.log(Facturas);
                    this.setState({ facturas: Facturas })
                })
                .catch(error => {
                    console.log(error);
                })
        }
    }

    render() {
        const facturas = this.state.facturas;
        return (
            <div>
                {
                    facturas.map(factura => (
                        <FacturaC
                            {...factura}>
                        </FacturaC>
                    ))}
            </div>
        );
    }
}