import React, { Component } from 'react';
import {Form, Button,Col} from 'react-bootstrap';
import {axiosInstance} from '../Config.js'
import Product from '../Components/ProductBasicInfo'

export default class Busqueda extends Component{

    constructor(props) {
        super(props);
        this.state = {
            productos: [],
            productoSeleccionado: "",
            seleccion_bus: 0
        }
        this.producto_a_buscar = this.producto_a_buscar.bind(this);
        this.tipo_busqueda = this.tipo_busqueda.bind(this);
        this.getProducts = this.getProducts.bind(this);

    }

    producto_a_buscar(event){
        this.setState({productoSeleccionado: event.target.value});
    }
    tipo_busqueda(event){
        this.setState({seleccion_bus: event.target.value});
    }


    getProducts(event) {
            event.preventDefault();
            if( this.state.seleccion_bus == 0){

            console.log("Obteniendo productos de categoria: ", this.state.productoSeleccionado)
            axiosInstance.get("producto/search/title/"+this.state.productoSeleccionado)
                .then(response => {
                    console.log("Productos en request: ", response.data)
                    // TODO cambiar productos
                    this.setState({productos: response.data})

                })
                .catch(error => {
                    console.log("Error en productos")
                })

            }else{

                console.log("Obteniendo productos de categoria: ", this.state.productoSeleccionado)
                axiosInstance.get("producto/search/description/"+this.state.productoSeleccionado)
                .then(response => {
                    console.log("Productos en request: ", response.data)
                    // TODO cambiar productos
                    this.setState({productos: response.data})
                })
                .catch(error => {
                    console.log("Error en productos")
                })

                
            }

        

    }





render(){

    return(

            <div>
            <Form onSubmit={this.getProducts}> 
                <Form.Row>
                    
                    <Form.Group as={Col} controlId="formGridState">
                    <Form.Label>Busque por </Form.Label>
                    <Form.Control as="select" onChange={this.tipo_busqueda}>
                        <option value ={0 }>Titulo de Producto</option>
                        <option value = {1}>Descripcion de Producto</option>
                    </Form.Control>
                    </Form.Group>

                    <Form.Group as={Col} controlId="formGridCity">
                    <Form.Label>Relacion a buscar</Form.Label>
                    <Form.Control onChange={this.producto_a_buscar} />
                    </Form.Group>


                    <Button variant="primary" type="submit"> buscar</Button>

                </Form.Row>
            </Form>

            <div id='listaProductos-div'> 

            
                    { 
                        this.state.productos.map(producto => (
                            <Product {...producto}> </Product>
                        ))
                    }
                
            </div>
           
            </div>


    );





    



}









}