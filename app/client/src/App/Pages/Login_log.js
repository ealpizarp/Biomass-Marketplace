import React, { Component } from 'react';
import {Form, Button,Col} from 'react-bootstrap';
import { Redirect } from "react-router-dom";
import './Styles/Login.css'
import {axiosInstance} from '../Config.js'



export default class Login_log extends Component {


    
    constructor(props) {
        super(props);
        this.state = {
            isLogged: false,
            redirect: false,
            username:"",
            pass:"",
            name:"",
            date:"",
            userType:0
            
        };
        console.log("Constructor")      
        this.C_User_Name = this.C_User_Name.bind(this);
        this.C_pass = this.C_pass.bind(this);
        this.C_name = this.C_name.bind(this);
        this.C_date = this.C_date.bind(this);
        this.C_User_Type = this.C_User_Type.bind(this);
        this.enviarInfo = this.enviarInfo.bind(this);
        
    }

    C_User_Name(event){
        this.setState({username: event.target.value});

    }
    C_pass(event){
        this.setState({pass: event.target.value});
    }
    C_name(event){
        this.setState({name: event.target.value});
    }
    C_date(event){
        this.setState({date: event.target.value});
    }
    C_User_Type(event){
        this.setState({userType: event.target.value});
    }

    enviarInfo(event){
        event.preventDefault();
        axiosInstance.post("/register", {
            username: this.state.username, 
            password: this.state.pass,
            whole_name: this.state.name,
            birth_date: this.state.date,
            user_type: this.state.userType
        })
        .then( response => {
            console.log("todo guchi", response.data);
        
        })
        .catch( error => {
            console.log( + error.response.data.error)
        }); 


    }

render(){

    const userType = localStorage.getItem("userType");
    let link;
    if (userType == "admin") {
        link = 
            <div>
                <Form.Label>User Type</Form.Label>
                <Form.Control as="select" defaultValue="Choose..." onChange={this.C_User_Type}>
                    <option value={0}>Client</option>
                    <option value={1}>Admin</option>
                </Form.Control>
            </div>
    } else {
        link = 
        <div> 
        <Form.Label>User Type</Form.Label>
        <Form.Control as="select" defaultValue="Choose..." onChange={this.C_User_Type}>
            <option value={0} >Client</option>
        </Form.Control>
        </div>;
    }


    return (
        <div id="login_log-div">

            <Form  onSubmit={this.enviarInfo}>
            <Form.Row>
                <Form.Group as={Col} controlId="formUserName">
                <Form.Label>User Name</Form.Label>
                <Form.Control type="text" placeholder="Enter User Name" onChange={this.C_User_Name} />
                </Form.Group>

                <Form.Group as={Col} controlId="formPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control type="password" placeholder="Password" onChange={this.C_pass}/>
                </Form.Group>
            </Form.Row>

            <Form.Group controlId="formName">
                <Form.Label>Complete Name</Form.Label>
                <Form.Control placeholder="Complete Name" onChange={this.C_name}/>
            </Form.Group>

            <Form.Group as={Col} controlId="formGridDia">
                    <Form.Label>Fecha Nacimiento: </Form.Label>
                    <Form.Control type="date" defaultValue='' onChange={this.C_date}  />
                    </Form.Group>

            

                <Form.Group  controlId="formGridState">
                {link}
                </Form.Group>


            <Button variant="primary" type="submit">
                Submit
            </Button>
            </Form>


        </div>
        
    );


}


}