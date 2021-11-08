import React from 'react';
import { Container, Row, Col, Alert, Table, Button } from 'react-bootstrap'
import { Redirect } from "react-router-dom";

export default class ComentarioC extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            show: true,
            redirect: false
        }
        this.handleVerCompras = this.handleVerCompras.bind(this)
    }

    handleVerCompras(event) {
        this.setState({redirect: true})
    }
    
    render() {
        if (this.state.redirect) {
            return (
                <Redirect to={{
                    pathname: '/facturas',
                    state: { username: this.props.username }
                }}
                />
            )
        }

        return (
            <Container>
                <Row>
                    <Col>
                        <label key='{this.props.username}'>{this.props.username}</label><br/>
                    </Col>
                    <Col>
                        <Button variant="primary" onClick={this.handleVerCompras}>Ver compras</Button>
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