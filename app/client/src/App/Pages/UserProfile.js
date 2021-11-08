/* eslint-disable react/jsx-key */
import React from 'react'
import { Form, Button, Image } from 'react-bootstrap';
import './Styles/UserProfile.css'
import { axiosInstance, baseURL } from '../Config.js'
import Upload from '../Components/UploadFile'

export default class UserProfile extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            /*
            username: 'pruebaUsername',
            password: 'asasdasdad',
            nombre: 'Esteban Torres',
            fechaNacimiento: '25/4/2000',
            */

            userInfo: null,

            newUsername: null,
            newNombre: null,
            newPassword: null,
            newDate: null,

            readOnly: true
        }
        this.cambiarFormAEditable = this.cambiarFormAEditable.bind(this)
        this.handleNameChange = this.handleNameChange.bind(this)
        this.handleUsernameChange = this.handleUsernameChange.bind(this)
        this.handlePasswordChange = this.handlePasswordChange.bind(this)
        this.uploadNewInfoHandle = this.uploadNewInfoHandle.bind(this)
        this.handleDateChange = this.handleDateChange.bind(this)
        this.handleImageChange = this.handleImageChange.bind(this)
    }

    cambiarFormAEditable() {
        this.setState({ readOnly: false })
    }

    handleNameChange(event) {
        this.setState({
            newNombre: event.target.value
        })
        console.log(this.state)
    }

    handleUsernameChange(event) {
        this.setState({
            newUsername: event.target.value
        })
        console.log(this.state)
    }

    handlePasswordChange(event) {
        this.setState({
            newPassword: event.target.value
        })
        console.log(this.state)
    }

    handleDateChange(event) {
        this.setState({ newDate: event.target.value })
    }

    uploadNewInfoHandle(event) {
        // SI no cambia el password que lo mande null
        let newData = {
            username: this.state.userInfo.username,
            password: this.state.newPassword,
            whole_name: this.state.newNombre,
            birth_date: this.state.newDate,
            user_type: localStorage.getItem("userType") == "admin" ? '1' : '0'
        }

        console.log(newData)

        axiosInstance.put('user/update', newData)
            .then(res => (
                console.log('Actualizado correctamente')
            ))
            .catch(error => (
                console.log("error actualizando datos")
            ))

        this.setState({ readOnly: true })
    }

    getUserInfo() {
        axiosInstance.get('user/' + localStorage.getItem('username'))
            .then(response => (
                this.setState({ userInfo: response.data })
            ))
            .catch(error => (
                console.log("ERROR: no se pudo obtener los datos del usuario")
            ))
    }

    handleImageChange(newImage) {
        let data = {
            username: this.state.userInfo.username,
            filename: newImage
        }
        axiosInstance.put("user/profile/picture", data)
        .then (res => {
            console.log("Imagen actualizada", res)
            this.getUserInfo()
        })
        .catch (error => {
            console.log("Error actualizando imagen: ", error)
        })
    }

    componentDidMount() {
        this.getUserInfo()
    }

    render() {
        const userInfo = this.state.userInfo;

        const infoButton = () => {
            if (this.state.readOnly && userInfo != null) {
                return <Button variant="primary" onClick={this.cambiarFormAEditable} >
                    Editar Informacion
                </Button>
            } else {
                return <Button variant="primary" onClick={this.uploadNewInfoHandle} >
                    Aceptar
                </Button>
            }
        }

        const imageUpload = () => {
            if (!this.state.readOnly) {
                console.log("Subir imagen");
                return <Upload uploadRoute="uploads/" handleImageChange={this.handleImageChange}></Upload>
            }
        }

        const infoForm = () => {
            if (userInfo != null) {
                let date = userInfo.fecha_nacimiento.split('T')[0]
                return [<Form onSubmit={this.handleLoginLocal} id="userProfile-basicdetails">

                    <Form.Group controlId="formBasicName" className='userProfile-basicdetails'>
                        <Form.Label>Nombre completo: </Form.Label>
                        <Form.Control defaultValue={userInfo.nombre_completo} onChange={this.handleNameChange} readOnly={this.state.readOnly} />
                    </Form.Group>

                    <Form.Group controlId="formBasicUsername" className='userProfile-basicdetails'>
                        <Form.Label>Username: </Form.Label>
                        <Form.Control defaultValue={userInfo.username} readOnly={true} />
                    </Form.Group>

                    <Form.Group controlId="formBasicPassword" className='userProfile-basicdetails'>
                        <Form.Label>Password: </Form.Label>
                        <Form.Control type="password" placeholder='******' onChange={this.handlePasswordChange} readOnly={this.state.readOnly} />
                    </Form.Group>

                    <Form.Group controlId="formGridDia" className='userProfile-basicdetails'>
                        <Form.Label>Fecha Nacimiento: </Form.Label>
                        <Form.Control type="date" defaultValue={date} onChange={this.handleDateChange} readOnly={this.state.readOnly} />
                    </Form.Group>
                    
                    {infoButton()}
                </Form>,
                <div id="profile-image-div">
                    <Image src={baseURL + 'file/' + userInfo.id_foto_usuario} rounded/>
                    {imageUpload()}
                </div>
                
                ]
            }
        }
        //const date = userInfo.fecha_nacimiento.split('/')
        return (
            <div id='main-div-userProfile'>
                {infoForm()}
            </div>
        );
    }
}