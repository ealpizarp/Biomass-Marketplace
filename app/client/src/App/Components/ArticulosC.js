import React from 'react';
import { Container, Row, Col, Alert, Form, Button } from 'react-bootstrap'
import { axiosInstance } from '../Config';

export default class ArticuloC extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            show: true
        }
        this.buttonFinalizarOnClick = this.buttonFinalizarOnClick.bind(this);
        this.handleBorrarButton = this.handleBorrarButton.bind(this);
    }

    buttonFinalizarOnClick(event) {
        this.setState({ show: false });
    }

    handleBorrarButton(event) {
        event.preventDefault()
        let datos = {
            user: localStorage.getItem("username"),
            item: this.props.id_producto
        }
        axiosInstance.post("removeItem", datos)
            .then(response => {
                console.log(response.data)
                window.location.reload(false);
            })
            .catch(error => {
            })
    }
    
    render() {

        return (
            <Container>
                <Row>
                    <Col >
                        <Alert show={this.state.show} variant="success">
                            <label id='titulo_producto'>{this.props.titulo_producto} x{this.props.cantidad}</label>
                            <div className="d-flex justify-content-end">
                                <label id='precio_producto'>¢{parseFloat(this.props.precio_producto) * parseInt(this.props.cantidad)}</label>
                            </div>
                            <Form onSubmit={this.handleBorrarButton}>
                                <Button variant="primary" type="submit">
                                    Borrar
                                </Button>
                            </Form>
                        </Alert>
                    </Col>
                </Row>
            </Container>

        );
    }
}