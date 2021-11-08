import React, { Component } from 'react';
import {Form, Button} from 'react-bootstrap';
import { Redirect } from "react-router-dom";
import './Styles/Login.css'
import {axiosInstance} from '../Config.js'
import Facturas from './Facturas';

function logOut() {
    console.log("Borrando local storage")
    localStorage.clear();
}

class Login extends Component {

    constructor(props) {
        super(props);
        this.state = {
            username: "",
            pass: "",
            redirect: null,
            userInfo: {
                username: 'pruebaUsername',
                password: 'asasdasdad',
                nombre: 'Esteban Torres',
                fechaNacimiento: '25/4/2000'
            },
            loginFailed: false
        }
        this.handleUsernameChange = this.handleUsernameChange.bind(this);
        this.handlePassChange = this.handlePassChange.bind(this);
        this.handleLogin = this.handleLogin.bind(this);
        this.handleRegister = this.handleRegister.bind(this);
    }

    handleUsernameChange(event) {
        this.setState({username: event.target.value});
        console.log(this.state)
    }

    handlePassChange(event) {
        this.setState({password: event.target.value});
    }

    handleLogin(event) {
        event.preventDefault();
        console.log(this.props);

        axiosInstance.post("login/", {
            username: this.state.username, 
            password: this.state.password
        })
        .then( response => {
            let tipo_usuario = response.data.tipo_usuario
            console.log("todo guchi", tipo_usuario);
            if (tipo_usuario != null) {
                localStorage.setItem('token', this.state.username);
                localStorage.setItem('username', this.state.username);
                localStorage.setItem('userType',  tipo_usuario);
                this.props.checkIfUserIsLogged();
                this.setState({redirect: '/'});
            } else {
                console.log("FAILED")
                this.setState({loginFailed: true})
            }
        })
        .catch( error => {
            console.log( + error.response.data.error)
        });    
    }

    handleRegister(event) {
        this.setState({redirect: '/Login_log'})
    }

    render() {
        
        const loginFailed = () => {
            console.log("failed: ", this.state.loginFailed)
            if (this.state.loginFailed) {
                return <p> Login Failed. Please try again. </p>
            }
            else {
                return ""
            }
        }
        if (this.state.redirect) {
            return <Redirect to={this.state.redirect} />
        }
        return (          
            <div id="main-login-div">
                
                <div id="formContent">

                    <Form onSubmit={this.handleLogin}>
                        <Form.Group controlId="formBasicUsername">
                            <Form.Label>Username</Form.Label>
                            <Form.Control type="username" placeholder="Enter username" onChange={this.handleUsernameChange}/>
                        </Form.Group>

                        <Form.Group controlId="formBasicPassword">
                            <Form.Label>Password</Form.Label>
                            <Form.Control type="password" placeholder="Password" onChange={this.handlePassChange}/>
                        </Form.Group>
                        <Button variant="primary" type="submit">
                            Iniciar sesión
                        </Button>
                    </Form>
                    <Button variant="primary" onClick={this.handleRegister}>
                        Registrar
                    </Button>
                    
                    <div id="formFooter">
                        <a className="underlineHover" href="#">Forgot Password?</a>
                    </div>
                    {loginFailed()}
                </div>
                
            </div>
        );
    }
}

export {Login, logOut}