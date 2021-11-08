import React, { Component } from 'react';
import {Form} from 'react-bootstrap';
import {axiosInstance} from '../Config.js'

/*
const instance = axios.create({
    baseURL: "http://localhost:8000"
})
*/

class Upload extends Component {

    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(event) {
        event.preventDefault()
        console.log(new FormData(event.target))
        axiosInstance.post(this.props.uploadRoute, new FormData( event.target ))
        .then (res => {
            console.log("Respuesta al subir imagen: ", res.data)
            this.props.handleImageChange(res.data)
        })
        .catch(error => {
            console.log("Error al subir imagen", error)
        })
    }

    render() {
        return (
            <div>
                <Form onSubmit={this.handleSubmit} encType="multipart/form-data" method="POST">
                    <p><input type="file" id="file" name="file" required className="form-control-file"/></p>
                    <p><button type="submit" value="upload">Subir imagen</button></p>
                </Form>
            </div>
        );
    }
}

export default Upload;