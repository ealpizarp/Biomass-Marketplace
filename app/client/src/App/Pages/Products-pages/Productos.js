/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React from 'react'
import Product from '../../Components/ProductBasicInfo'

import '../Styles/Productos.css'
import { axiosInstance } from "../../Config.js"
import {Button } from 'react-bootstrap'
 
export default class Productos extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            productos: [],
            recomendaciones: [],
            categorias: [],
            categoriaSeleccionada: "",
            fullProductInfo: null,
            productoSeleccionado: null,
            or_precio:0
        }
        this.handleCategoryChange = this.handleCategoryChange.bind(this);
        this.reRenderProductos = this.reRenderProductos.bind(this)
        this.ordenarPrecio = this.ordenarPrecio.bind(this);
        this.cambio_valor = this.cambio_valor.bind(this);
        
    }

    cambio_valor(event){
        if(this.state.or_precio != 1){
        this.setState({or_precio:1})
        }else{
        this.setState({or_precio:0})
        }
        this.ordenarPrecio()
    }

    ordenarPrecio(){
        if(this.state.or_precio ==1){
        let productos_sin_preden = this.state.productos
        productos_sin_preden.sort(function(a, b){
            return a.precio - b.precio;
        });
        
       this.setState({productos:productos_sin_preden})
    }else{

        let productos_sin_preden = this.state.productos
        productos_sin_preden.sort(function(a, b){
            return b.precio - a.precio;
        });
        
       this.setState({productos:productos_sin_preden})


    }
    
        
    }

    getProducts() {
        console.log("Obteniendo productos de categoria: ", this.state.categoriaSeleccionada)
        axiosInstance.get("/categorias/"+this.state.categoriaSeleccionada)
            .then(response => {
                console.log("Productos en request: ", response.data)
                // TODO cambiar productos
                this.setState({productos: response.data},this.ordenarPrecio)
            })
            .catch(error => {
                console.log("Error en productos")
            })
    }

    getCategorias() {
        console.log("Obteniendo categorias")
        axiosInstance.get("/categorias")
            .then(response => {
                this.setState({ categorias: response.data, categoriaSeleccionada: response.data[0]}, this.getProducts)
                
            })
            .catch(error => {
                console.log("Error en categorias")
            })
    }

    getRecomendaciones(){
        console.log("Obteniendo recomendaciones")
        if(localStorage.getItem("username")){
            axiosInstance.get("/user/recommendations/"+localStorage.getItem("username"))
                .then(response =>{
                    console.log("Recomendaciones: ", response.data);
                    if (response.data != "The user has no recommendations") {
                        this.setState({recomendaciones: response.data});
                    }
                }).catch(error =>{
                    console.log(error);
                });
        }
    }

    handleCategoryChange(event) {
        console.log(event.target.value)
        let nuevoValor = event.target.value
        if(this.state.categoriaSeleccionada != nuevoValor) {
            this.setState({categoriaSeleccionada: nuevoValor}, this.getProducts)         
        }
    }

    reRenderProductos() {
        console.log("forceReload")
        this.getCategorias()
        this.getRecomendaciones()
    }

    componentDidMount() {
        console.log("MOUNTED")
        this.getCategorias()
        this.getRecomendaciones()
    }

    render() {

        const categorias = this.state.categorias;
        const productos = this.state.productos;
        const recomendaciones = this.state.recomendaciones;
        console.log("asl: ", this.state.fullProductInfo)

        return (
            
            <div id='productos-main-div'>
                <div id="recomendaciones-div">
                    <label><h3>Recomendaciones</h3></label>
                    <label>Basadas en sus compras anteriores</label>
                    <div id='listaProductos-div'>
                        {
                            recomendaciones.map(producto => (
                                <Product {...producto} categoriaSeleccionada={this.state.categoriaSeleccionada} reRenderProductos={this.reRenderProductos}> </Product>
                            ))
                        }
                    </div>
                </div>
                <div id='productos-sub-div'>
                    <div id="categorias-div">
                        {
                            categorias.map(categoria => (
                                <Button as="input" type="button" onClick={this.handleCategoryChange} variant="link" value={categoria}></Button>
                            ))
                        }
                        <Button variant="outline-success" onClick={this.cambio_valor}>Ordenar por Precio</Button >
                    </div>
                    <div id='listaProductos-div'>
                        {
                            productos.map(producto => (
                                <Product {...producto} categoriaSeleccionada={this.state.categoriaSeleccionada} reRenderProductos={this.reRenderProductos}> </Product>
                            ))
                        }
                    </div>
                </div>
            </div>
        );
    }
}