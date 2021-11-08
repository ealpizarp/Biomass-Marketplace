/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React from 'react';
import './Styles/Product.css'
import { Button, Modal, Form, Label, Col, option } from 'react-bootstrap'
import ProductFullInfo from './ProductFullInfo'
import { axiosInstance, baseURL } from '../Config';
import Upload from '../Components/UploadFile.js'

export default class Product extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            info: null,
            fullProductInfo: null,
            show: false,
            newTitulo: null,
            newDescripcion: null,
            newPrecio: null,
            newEnvio: null,
            newInventario: null,
            newBloqueado: null,
            newCategoria: null,
            categorias: []

        }
        this.botonVerInformacionOnClick = this.botonVerInformacionOnClick.bind(this)
        this.closeFullInfoButtonHandle = this.closeFullInfoButtonHandle.bind(this)
        this.handleClose = this.handleClose.bind(this)
        this.handleShow = this.handleShow.bind(this)

        this.handleTituloChange = this.handleTituloChange.bind(this)
        this.handleDescripcionChange = this.handleDescripcionChange.bind(this)
        this.handlePrecioChange = this.handlePrecioChange.bind(this)
        this.handleEnvioChange = this.handleEnvioChange.bind(this)
        this.handleInventarioChange = this.handleInventarioChange.bind(this)
        this.handleBloquedoChange = this.handleBloquedoChange.bind(this)
        this.handleProductUpdate = this.handleProductUpdate.bind(this)
        this.handleCategoriaChange = this.handleCategoriaChange.bind(this)
        this.handleEliminar = this.handleEliminar.bind(this)
        this.handleImageChange = this.handleImageChange.bind(this)
        this.handleAddSecondaryImage = this.handleAddSecondaryImage.bind(this)
    }

    handleClose() {
        this.setState({ show: false }, this.props.reRenderProductos)
    }

    handleShow() {

        console.log("Producto seleccionado: ", this.props)
        axiosInstance.get("producto/" + this.props.id_mysql)
            .then(response => {
                this.setState({ info: response.data }, () => (this.setState({ show: true })))
            })
            .catch(error => {
                console.log("ERROR obtienen toda la info del producto")
            })
    }



    botonVerInformacionOnClick() {
        console.log("Producto seleccionado: ", this.props)
        axiosInstance.get("producto/" + this.props.id_mysql)
            .then(response => {
                this.setState({ fullProductInfo: response.data })
            })
            .catch(error => {
                console.log("ERROR obtienen toda la info del producto")
            })
    }

    closeFullInfoButtonHandle() {
        console.log("CERRANDO VENTANA")
        this.setState({
            fullProductInfo: null
        })
    }

    handleTituloChange(event) {
        this.setState({ newTitulo: event.target.value })
    }

    handleDescripcionChange(event) {
        this.setState({ newDescripcion: event.target.value })
    }

    handlePrecioChange(event) {
        this.setState({ newPrecio: event.target.value })
    }

    handleEnvioChange(event) {
        this.setState({ newEnvio: event.target.value })
    }

    handleInventarioChange(event) {
        this.setState({ newInventario: event.target.value })
    }

    handleBloquedoChange(event) {
        this.setState({ newBloqueado: event.target.value })
    }

    handleCategoriaChange(event) {
        this.setState({ newCategoria: event.target.value })
    }

    handleProductUpdate(event) {
        let datosProducto = {
            id_mysql: this.props.id_mysql,
            title: this.state.newTitulo,
            description: this.state.newDescripcion,
            price: this.state.newPrecio,
            category: this.state.newCategoria,
            inventory: this.state.newInventario,
            express_shipping: this.state.newEnvio,
            blocked_product: this.state.newBloqueado
        }

        console.log(datosProducto)

        const handleClose = () => (
            this.handleClose()
        )

        axiosInstance.put('producto/update', datosProducto)
            .then(res => (
                console.log("Producto actualizado"),
                handleClose()
            ))
            .catch(error => (
                console.log("Producto no actualizado ", error)
            ))

    }

    handleEliminar(event) {
        axiosInstance.delete('producto/delete/' + this.props.id_mysql)
            .then(res => (
                console.log("Producto borrado")
            ))
            .catch(error => (
                console.log("Error al borrar producto")
            ))
        this.handleClose()
    }

    handleImageChange(newImage) {
        let data = {
            product_id: this.props.id_mysql,
            filename: newImage
        }
        axiosInstance.put("producto/add/main/photo", data)
            .then(res => {
                console.log("Imagen actualizada", res)
            })
            .catch(error => {
                console.log("Error actualizando imagen: ", error)
            })
    }

    handleAddSecondaryImage(newImage) {
        let data = {
            product_id: this.props.id_mysql,
            image_filename: newImage
        }
        axiosInstance.post("producto/add/photo", data)
            .then(res => {
                console.log("Imagen actualizada", res)
            })
            .catch(error => {
                console.log("Error actualizando imagen: ", error)
            })
    }

    componentDidMount() {
        axiosInstance.get("/categorias")
            .then(response => {
                console.log("categorias en request", this.state.categorias)
                this.setState({ categorias: response.data })

            })
            .catch(error => {
                console.log("Error en categorias")
            })

    }

    render() {


        const fullInfo = () => {
            if (this.state.fullProductInfo != null) {
                return <ProductFullInfo {...this.state.fullProductInfo} closeFullInfoButtonHandle={this.closeFullInfoButtonHandle}></ProductFullInfo>
            }
        }

        const userType = localStorage.getItem("userType");
        const editButton = () => {
            if (userType == "admin") {
                return <Button variant="primary" onClick={this.handleShow}>
                    editar
                    </Button>
            }
        }

        const modalEditar = () => {
            if (this.state.show) {
                return <Modal show={true} onHide={this.handleClose}>
                    <Modal.Header closeButton>
                        <Modal.Title>Editar producto</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>

                        <Form>
                            <Form.Group controlId="formTitulo">
                                <Form.Label>Titulo del producto</Form.Label>
                                <Form.Control defaultValue={this.state.info.titulo_producto} onChange={this.handleTituloChange} />
                            </Form.Group>

                            <Form.Group controlId="formDescripcion">
                                <Form.Label>Descripcion del producto</Form.Label>
                                <Form.Control as="textarea" rows={4} defaultValue={this.state.info.descripcion_producto} onChange={this.handleDescripcionChange} />
                            </Form.Group>

                            <Form.Group controlId="formPrecio">
                                <Form.Label>Precio</Form.Label>
                                <Form.Control defaultValue={this.state.info.precio_producto} onChange={this.handlePrecioChange} />
                            </Form.Group>

                            <Form.Group controlId="formEnvioRapido">
                                <Form.Label>Envio rapido</Form.Label>
                                <Form.Control as="select" defaultValue={this.state.info.envio_rapido == "Disponible" ? "1" : "0"} onChange={this.handleEnvioChange}>
                                    <option value="0">No disponible</option>
                                    <option value="1">Disponible</option>
                                </Form.Control>
                            </Form.Group>

                            <Form.Group controlId="formInventario">
                                <Form.Label>Inventario</Form.Label>
                                <Form.Control defaultValue={this.state.info.inventario_producto} onChange={this.handleInventarioChange} />
                            </Form.Group>

                            <Form.Group controlId="formBloqueado">
                                <Form.Label>Bloqueado</Form.Label>
                                <Form.Control as="select" defaultValue={this.state.info.producto_bloqueado == "No" ? "0" : "1"} onChange={this.handleBloquedoChange}>
                                    <option value="0">Disponible</option>
                                    <option value="1">No disponible</option>
                                </Form.Control>
                            </Form.Group>

                            <Form.Group controlId="formCategoria">
                                <Form.Label column sm="2">
                                    Categoria
                                    </Form.Label>
                                <Form.Control as="select" size="sm" custom defaultValue={this.props.categoriaSeleccionada} onChange={this.handleCategoriaChange}>
                                    {this.state.categorias.map(elemento => (
                                        <option value={elemento}>{elemento}</option>
                                    ))}
                                </Form.Control>

                            </Form.Group>


                        </Form>

                        <label>Cambiar imagen principal</label>
                        <Upload uploadRoute="uploads/" handleImageChange={this.handleImageChange}></Upload>
                        
                        <label>Añadir imagen secundaria</label>
                        <Upload uploadRoute="uploads/" handleImageChange={this.handleAddSecondaryImage}></Upload>

                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={this.handleClose}>
                            Cerrar
                        </Button>
                        <Button variant="danger" onClick={this.handleEliminar}>
                            Eliminar producto
                        </Button>
                        <Button variant="primary" onClick={this.handleProductUpdate}>
                            Guardar cambios
                        </Button>
                    </Modal.Footer>
                </Modal>
            }
        }

        return (

            <div id="main-products-div">
                {fullInfo()}
                <div id="main-product-wrapper">
                    <div id="main-product-wrapper-img">
                        <img src={baseURL + 'file/' + this.props.main_image}></img>
                    </div>

                    <label id='nombre'>{this.props.nombre}</label>
                    <label id='precio'>¢{this.props.precio}</label>
                    {editButton()}
                    <Button
                        className="product-edit-button"
                        variant="primary"
                        onClick={this.botonVerInformacionOnClick}
                    >Ver informacion
                    </Button>
                </div>

                <div>

                    {modalEditar()}

                </div>
            </div>
        );
    }
}