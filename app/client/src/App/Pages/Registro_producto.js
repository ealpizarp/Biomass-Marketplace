import React from "react"
import { Row, Form, Col } from 'react-bootstrap'
import './Styles/Login.css'
import { Button } from 'react-bootstrap'
import { axiosInstance } from "../Config.js"

export default class Registro_producto extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            categorias: [],
            product_name: null,
            description: null,
            price: null,
            inventory: null,
            envio: 0,
            categoria: null,
            lock: 0


        }
        this.C_name = this.C_name.bind(this);
        this.C_description = this.C_description.bind(this);
        this.C_price = this.C_price.bind(this);
        this.C_inventory = this.C_inventory.bind(this);
        this.C_envio = this.C_envio.bind(this);
        this.C_categoria = this.C_categoria.bind(this);
        this.C_lock = this.C_lock.bind(this);
        this.enviarInfo = this.enviarInfo.bind(this);


    }


    C_name(event) {
        this.setState({ product_name: event.target.value });

    }

    C_description(event) {
        this.setState({ description: event.target.value });

    }
    C_price(event) {
        this.setState({ price: event.target.value });

    }
    C_inventory(event) {
        this.setState({ inventory: event.target.value });

    }
    C_envio(event) {
        this.setState({ envio: event.target.value });

    }
    C_categoria(event) {
        this.setState({ categoria: event.target.value });

    }
    C_lock(event) {
        this.setState({ lock: event.target.value });

    }


    enviarInfo(event) {
        event.preventDefault();
        axiosInstance.post("/producto/register", {
            title: this.state.product_name,
            description: this.state.description,
            price: this.state.price,
            inventory: this.state.inventory,
            category: this.state.categoria != null ? this.state.categoria : this.state.categorias[0],
            express_shipping: this.state.envio,
            blocked_product: this.state.lock

        })
            .then(response => {
                console.log("todo guchi", response.data);

            })
            .catch(error => {
                console.log(+ error.response.data.error)
            });

    }






    componentDidMount() {
        axiosInstance.get("/categorias")
            .then(response => {
                console.log("categorias en request", this.state.categorias)
                this.setState({ categorias: response.data })

            })
            .catch(error => {
                console.log("Error en categorias")
            })

    }


    render() {


        return (

            <div id="form_registrar_producto">
                <Form onSubmit={this.enviarInfo}>
                    <Form.Group as={Row} controlId="formPlaintextEmail">
                        <Form.Label column sm="2">
                            Product Name
                    </Form.Label>
                        <Col sm="10">
                            <Form.Control placeholder="Product Name" onChange={this.C_name} />
                        </Col>
                    </Form.Group>

                    <Form.Group as={Row} controlId="formPlaintextPassword">
                        <Form.Label column sm="2">
                            Description
                    </Form.Label>
                        <Col sm="10">
                            <Form.Control placeholder="Description" onChange={this.C_description} />
                        </Col>
                    </Form.Group>


                    <Form.Group as={Row} controlId="formPlaintextPassword">
                        <Form.Label column sm="2">
                            Price
                    </Form.Label>
                        <Col sm="10">
                            <Form.Control placeholder="Price" onChange={this.C_price} />
                        </Col>
                    </Form.Group>



                    <Form.Group as={Row} controlId="formPlaintextPassword">
                        <Form.Label column sm="2">
                            Inventory Items
                    </Form.Label>
                        <Col sm="10">
                            <Form.Control placeholder="Inventory Items" onChange={this.C_inventory} />
                        </Col>
                    </Form.Group>


                    <Form.Group as={Row} controlId="formPlaintextPassword">
                        <Form.Label column sm="2">
                            Informacion de Envio
                    </Form.Label>
                        <Col sm="10">
                            <Form.Control as="select" size="sm" custom onChange={this.C_envio}>
                                <option value={1}>Envio express</option>
                                <option value={0}>Envio lento</option>
                            </Form.Control>
                        </Col>
                    </Form.Group>


                    <Form.Group as={Row} controlId="formPlaintextPassword">
                        <Form.Label column sm="2">
                            Categoria
                    </Form.Label>
                        <Col sm="10">
                            <Form.Control as="select" size="sm" custom onChange={this.C_categoria}>
                                {this.state.categorias.map(elemento => (
                                    <option value={elemento}>{elemento}</option>
                                ))}

                            </Form.Control>
                        </Col>
                    </Form.Group>



                    <Form.Group as={Row} controlId="formPlaintextPassword">
                        <Form.Label column sm="2">
                            Bloked Product
                    </Form.Label>
                        <Col sm="10">
                            <Form.Control as="select" size="sm" custom onChange={this.C_lock}>
                                <option value={0}>no lock</option>
                                <option value={1}>lock</option>
                            </Form.Control>
                        </Col>
                    </Form.Group>


                    <div className="d-flex justify-content-end">
                        <Button variant="success" type="submit">Save</Button>
                    </div>


                </Form>




            </div>




        )


    }











}
