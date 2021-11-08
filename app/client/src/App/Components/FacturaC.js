import React from 'react';
import { Container, Row, Col, Alert, Form, Button } from 'react-bootstrap'
import { axiosInstance } from '../Config';

export default class FacturaC extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            show: true
        }
    }

    ispublic(item){
        if(item){
            return <label>Orden publica</label>
        }else{
            return <label>Orden privada</label>
        }
    }

    render() {
        var date = new Date(this.props.date);
        return (
            <Container>
                <Row>
                    <Col>
                        <Alert show={this.state.show} variant="info">
                            <label id='Cliente'>Cliente: {this.props.client}</label><br/>
                            <label id='Fecha_Factura'>Fecha de compra: {new Intl.DateTimeFormat("es-LA", {
                                                                                year: "numeric",
                                                                                month: "long",
                                                                                day: "2-digit"
                                                                                }
                                                                            ).format(date)
                                                                        }
                                </label><br/>
                            <label id='hora_factura'>Hora: {
                                new Intl.DateTimeFormat("es-LA", {hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true}).format(date)
                            }</label><br/>
                            {this.ispublic(this.props.publica)}
                            <br/>
                            <label>Lista de productos:</label>
                            <hr/>
                            {
                            this.props.items.map(item => (
                                <Container>
                                    <Row>
                                        <Col>
                                            <label id='producto'>Nombre: {item.titulo_producto}</label><br/>
                                            <label id='cantidad'>Cantidad: {item.cantidad}</label><br/>
                                            <label id='precio_producto'>Precio: ¢{item.precio_producto}</label><br/>
                                        </Col>
                                        <Col>
                                            <br/><br/>
                                            <label>Subtotal: {item.cantidad*parseFloat(item.precio_producto)}</label>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col><hr/></Col>
                                    </Row>
                                </Container>
                            ))}
                            <Container>
                                <Row>
                                    <Col>
                                        <label>Total:</label><br/>
                                    </Col>
                                    <Col>
                                        <label>¢{this.props.total}</label><br/>
                                    </Col>
                                </Row>
                            </Container>
                        </Alert>
                    </Col>
                </Row>
            </Container>

        );
    }
}