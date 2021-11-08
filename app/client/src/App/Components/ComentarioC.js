import React from 'react';
import { Container, Row, Col, Alert, Table, Button } from 'react-bootstrap'
import { baseURL } from '../Config';

export default class ComentarioC extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            show: true
        }
    }
    
    render() {
        return (
            <Container>
                <Row>
                    <Col>
                        <img src={baseURL+'file/'+this.props.foto} alt='foto del usuario' width="64" height="64"></img><br/>
                        <label key='{this.props.username}'>{this.props.nombre}</label><br/>
                    </Col>
                    <Col>
                        <label key='{this.props.comentario}'>{this.props.comentario}</label>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <hr />
                    </Col>
                </Row>
            </Container>
        );
    }
}