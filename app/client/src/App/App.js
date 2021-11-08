/* eslint-disable react/jsx-key */
import React, { Component } from 'react';
import { Login, logOut } from './Pages/login';
import Upload from './Components/UploadFile';
import Productos from './Pages/Products-pages/Productos'
import UserProfile from './Pages/UserProfile'
import Friends from './Pages/Friends'
import Login_log from './Pages/Login_log'
import Compras from './Pages/Compras'
import Registro_producto from "./Pages/Registro_producto"
import Busqueda from "./Pages/Busqueda"
import Facturas from "./Pages/Facturas"
import './App.css';
import { BrowserRouter, Switch, Route, Link } from 'react-router-dom';
import { Nav, Button, Form, FormControl } from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css';


class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isLogged: false,
            redirect: false

        };
        console.log("Constructor")
        this.checkIfUserIsLogged = this.checkIfUserIsLogged.bind(this)

    }

    checkIfUserIsLogged() {
        /*
        if (!localStorage.getItem("token")) {
            return false;
        }
        return true;
        */
        if (!localStorage.getItem("token")) {
            this.setState({ isLogged: false })
        } else {
            this.setState({ isLogged: true })
        }
        console.log("checking ##########")
    }

    componentDidMount() {
        console.log("MOUNTED#########")
        this.checkIfUserIsLogged()
    }

    render() {
        const isLogged = this.state.isLogged;
        const name = localStorage.getItem("username")

        const loggedOnlyOptions = () => {
            console.log("username: ", localStorage.getItem("username"))
            if (localStorage.getItem("username") != null) {
                return [<Nav.Item as="li">
                    <Link to={'/userProfile'} className="nav-link">Ver perfil</Link>
                </Nav.Item>,
                <Nav.Item as="li">
                    <Link to={'/friends'} className="nav-link">Ver amigos</Link>
                </Nav.Item>
                ]
            } else {
                return <Nav.Item as="li">
                    <Link to={'/login'} className="nav-link">Login</Link>
                </Nav.Item>
            }
        }

        const adminOnlyOptions = () => {
            if (localStorage.getItem("userType") == "admin") {
                return [
                    <Nav.Item as="li">
                        <Link to={'/login_log'} className="nav-link">Registrar</Link>
                    </Nav.Item>,
                    <Nav.Item as="li">
                        <Link to={'/Registro_producto'} className="nav-link">Registrar Producto</Link>
                    </Nav.Item>
                ]
            }
        }

        const renderLogOutButton = () => {
            if (isLogged) {
                return <Button variant="link" onClick={() => {
                    logOut();
                    this.checkIfUserIsLogged();
                }}>
                    Cerrar Sesion
                </Button>
            }
        }

        return (
            <BrowserRouter>
            <div>
                <div id="headerPanel">
                    <h2 id="userWelcome">Bienvenido {name}</h2>
                    <Nav className="justify-content-center" as='ul'>
                        <Nav.Item as="li">
                            <Link to={'/productos'} className="nav-link">Inicio</Link>
                        </Nav.Item>

                        {loggedOnlyOptions()}

                        {adminOnlyOptions()}
                        {/*
                        <Nav.Item as="li">
                            <Link to={'/upload'} className="nav-link">Upload</Link>
                        </Nav.Item>
                        */}
                        <Nav.Item as="li">
                            <Link to={'/compras'} className="nav-link">Compras</Link>
                        </Nav.Item>
                        <Nav.Item as="li">
                            <Link to={'/facturas'} className="nav-link">Facturas</Link>
                        </Nav.Item>
                        {renderLogOutButton()}
                        <div className="d-flex justify-content-end">
                        <Form inline>
                        <Link to={'/busqueda'}  >
                            <Button  variant="outline-success" >Search</Button>
                        </Link>
                        
                        </Form>
                        </div>
                    </Nav>
                    <hr />
                </div>
                <div id="switchPanel">
                    <Switch>
                        <Route path='/productos' component={Productos} />
                        <Route path='/login' render={() => (
                            <Login checkIfUserIsLogged={this.checkIfUserIsLogged}></Login>
                        )} />
                        <Route path='/userProfile' component={UserProfile} />
                        <Route path='/friends' component={Friends} />
                        {/*<Route path='/upload' component={Upload} />*/}
                        <Route path='/compras' component={Compras} />
                        <Route path='/login_log' component={Login_log} />
                        <Route path='/Registro_producto' component={Registro_producto} />
                        <Route path='/facturas' render={(props) => <Facturas {...props}></Facturas>} />
                        <Route path='/busqueda' component={Busqueda}/>
                    </Switch>
                </div>
            </div>
            </BrowserRouter>
        );
    }
}

export default App;