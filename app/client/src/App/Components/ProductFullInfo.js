/* eslint-disable react/jsx-key */
/* eslint-disable react/prop-types */
import React, { Component } from 'react';
import './Styles/ProductFullInfo.css'
import ComentarioC from '../Components/ComentarioC'
import Gallery from '../Components/imageGallery'
import { Button, Form, ResponsiveEmbed, Table, Row, Col, Container } from 'react-bootstrap'
import { axiosInstance, baseURL } from '../Config';

export default class ProductFullInfo extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            cantidad: 1,
            rating: 0,
            comentarios: [],
            errorAlComprar: false,
            calificacion: 0,
            comment: "",
            count: 0,
            media: [],
            show: false
        }
        this.closeButtonHandle = this.closeButtonHandle.bind(this)
        this.handleComprarButton = this.handleComprarButton.bind(this)
        this.handleComentarButton = this.handleComentarButton.bind(this)
        this.handleCantidadChange = this.handleCantidadChange.bind(this)
        this.changeHandler = this.changeHandler.bind(this)
        this.fetchImages = this.fetchImages.bind(this)
    }

    changeHandler(event){
        this.setState({[event.target.name]: event.target.value});
    }

    updateComments(){
        console.log("Loading comments");
        let prod = this.props.id_producto;
        var i = 0;
        var com = []
        var promises = []
        axiosInstance.get('producto/rating/'+prod)
            .then(response =>{
                if(response.data.rating){
                    this.setState({rating: response.data.rating});
                } else {
                    console.log("Error al obtener rating", response.data)
                }
            }).catch(error => {
                console.log(error);
            });
        
        axiosInstance.get('producto/comentarios/'+prod)
            .then(response=>{
                com = response.data;
                com.forEach(comentario => {
                    promises.push(this.getUserInfo(comentario.username));
                });
                Promise.all(promises).then((values) =>{
                    values.map(value =>{
                        com[i]["nombre"] = value.data.nombre_completo;
                        com[i]["foto"] = value.data.id_foto_usuario;
                        i+=1;
                    });
                });
                this.setState({comentarios: com});
            }).catch(error => {
                console.log(error);
            });
        
    }

    fetchImages(){
        console.log("Loading images");
        let prod = this.props.id_producto;
        var imgs = [];
        axiosInstance.get('producto/imagenes/'+prod).then( response =>{
            if(response.data){
                response.data.forEach(element => {
                    let data = {
                        thumbnail: baseURL+"file/"+element,
                        original: baseURL+"file/"+element,
                        media: '(width: 100px)' 
                    }
                    imgs.push(data);
                });
            }
            this.setState({media: imgs, show: true});
        }).catch(error => {
            console.log(error);
        });
    }

    componentDidMount() {
        this.fetchImages();
        this.updateComments();
        this.interval = setInterval(() => {
            this.setState(({ count }) => ({ count: count + 1 }));
        }, 1000);
    }

    componentWillUnmount(){
        clearInterval(this.interval);
    }

    getUserInfo(username){
        return axiosInstance.get('/user/'+username);
               // comentario["nombre"] = datosUsuario.nombre_completo;
               // comentario["foto"] = datosUsuario.id_foto_usuario;
    }

    closeButtonHandle() {
        this.props.closeFullInfoButtonHandle()
    }

    handleCantidadChange(event) {
        let nuevaCantidad = parseInt(event.target.value)
        console.log("nueva cantidad: ", nuevaCantidad)
        if (nuevaCantidad > 0) {
            this.setState({
                cantidad: nuevaCantidad
            })
        } else {
            event.target.value = 1;
        }
    }

    handleComentarButton(event) {
        event.preventDefault()
        var datos = {
            username: localStorage.getItem("username"),
            product_id: this.props.id_producto,
            rating: this.state.calificacion
        }
        axiosInstance.post('producto/rate',datos).then(response =>{
            console.log(response);
        }).catch(error => {
            console.log(error);
        });
        var datosComentario = {
            username: localStorage.getItem("username"),
            product_id: this.props.id_producto,
            comentario: this.state.comment
        }
        axiosInstance.post('user/comentar/producto', datosComentario).then(response =>{
            console.log(response);
        }).catch(error => {
            console.log(error);
        });
        this.updateComments();
    }
    
    añadirAlCarro(datos) {
        axiosInstance.post("addItem", datos)
            .then(response2 => {
                console.log("Añadido al carro")
                console.log(response2.data)
            })
            .catch(error => {
                console.log("ERROR: en añadir al carro")
            })
    }

    handleComprarButton(event) {
        event.preventDefault()

        var datos = {
            user: localStorage.getItem("username"),
            item: this.props.id_producto,
            amount: this.state.cantidad
        }

        const changeState = () => (
            this.setState({errorAlComprar: true})
        )

        const añadirAlCarro = () => {
            this.añadirAlCarro(datos)
        }

        axiosInstance.get('producto/inventario/' + datos.item)
            .then(function (response) {
                // Verifica cantidad
                if (response.data >= datos.amount) {
                    añadirAlCarro()
                } else {
                    console.log("ERROR: cantidad mayor al inventario")
                    changeState()
                }
            })
            .catch(error => (
                console.log("ERROR: en obtener inventario", error, datos.item)
            ))

        
    }

    render() {

        const errorMessage = () => {
            if (this.state.errorAlComprar) {
                return <p> Cantidad maxima superada </p>
            }
        }

        const gallery = () =>{
            if(this.state.media[0]) {
                return <div id="gallery-container">
                            <Gallery 
                                images={this.state.media}
                                lazyLoad={true}
                                showFullscreenButton={false}
                                showPlayButton={false}
                                showNav={true}
                                showThumbnails={false}
                                >
                            </Gallery>
                        </div>
            }else{
                return <p>No hay imagenes para este producto.</p>
            }
        }

        const adminOnly = () => {
            if (localStorage.getItem("userType") == "admin") {
                return [<label id='producto_bloqueado'> Bloqueado: {this.props.producto_bloqueado} </label>,
                <label id='id_producto'>{this.props.id_producto}</label>]
            }
        }

        const comentarios = this.state.comentarios;
        
        return this.state.show ?(
            <div id="main-producFullInfo-div">
                <div id="close-button-div">
                    <Button variant="primary" onClick={this.closeButtonHandle}>Cerrar ventana</Button>
                </div>
                <div id="main-producFullInfo-wrapper">
                    <label id='titulo_producto'>
                        Nombre: {this.props.titulo_producto}
                    </label>
                    <label id='descripcion_producto'>
                        Descripcion: {this.props.descripcion_producto}
                    </label>
                    <label id='precio_producto'>
                        Precio: ¢{this.props.precio_producto}
                    </label>
                    <label id='envio_rapido'>
                        Envío rapido: {this.props.envio_rapido}
                    </label>
                    <label id='inventario_producto'>
                        Cantidad disponible: {this.props.inventario_producto}
                    </label>
                    {adminOnly()}
                </div>

                {errorMessage()}

                <Form onSubmit={this.handleComprarButton}>
                    <Form.Group controlId="formCantidad">
                        <Form.Label>Catidad a comprar</Form.Label>
                        <Form.Control type="number" defaultValue="1" onChange={this.handleCantidadChange} />
                    </Form.Group>
                    <Button variant="primary" type="submit">
                        Comprar
                    </Button>
                </Form>
                <hr/>
                <Container>
                    <Row>
                        <Col>
                            <Form onSubmit={this.handleComentarButton}>
                                <Form.Group controlId="formComentario">
                                    <Form.Label>Calificación</Form.Label>
                                    <Form.Control type="number" name="calificacion" defaultValue="1" max="5" min="1" onChange={this.changeHandler}/>
                                    <br/>
                                    <Form.Label>Comentario</Form.Label>
                                    <br/>
                                    <textarea name="comment" rows="5" onChange={this.changeHandler}/>
                                </Form.Group>
                                <Button variant="primary" type="submit">
                                    Comentar
                                </Button>
                            </Form>
                        </Col>
                        <Col>
                        {gallery()}
                        </Col>
                    </Row>
                </Container>
                <hr/>
                <div id="main-product-comments">
                    <label id='rating'>Rating: {this.state.rating}</label>
                    <hr />
                    {
                        comentarios.map(comentario => (
                            <ComentarioC
                                {...comentario}>
                            </ComentarioC>
                        ))
                    }
                </div>
            </div>
        ) : null;
    }
}