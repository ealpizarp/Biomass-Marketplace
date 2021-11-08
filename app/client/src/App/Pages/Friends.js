/* eslint-disable react/jsx-key */
import React from 'react'
import { axiosInstance } from '../Config.js'
import { Form, Button } from 'react-bootstrap'
import './Styles/Friends.css'
import Friend from '../Components/Friend.js'


export default class Friends extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            users: null,
            friends: null,
            selectedOption: null
        }
        this.getAllUsers = this.getAllUsers.bind(this)
        this.getFriends = this.getFriends.bind(this)
        this.handleSelectedFriendChange = this.handleSelectedFriendChange.bind(this)
        this.handleAddFriend = this.handleAddFriend.bind(this)
    }

    getAllUsers() {
        axiosInstance.get("users/")
            .then(res => {
                console.log("Usuarios: ", res.data)
                this.setState({ users: res.data })
                this.setState({ selectedOption: res.data[0].username })
            })
            .catch(error => {
                console.log("Error obteniendo usuarios", error)
            })
    }

    getFriends() {
        axiosInstance.get("user/following/" + localStorage.getItem("username"))
            .then(res => {
                console.log("Amigos: ", res.data)
                this.setState({ friends: res.data })
            })
            .catch(error => {
                console.log("Error obteniendo amigos", error)
            })
    }

    handleSelectedFriendChange(event) {
        this.setState({ selectedOption: event.target.value })
    }

    handleAddFriend(event) {
        let data = {
            username_a: localStorage.getItem("username"),
            username_b: this.state.selectedOption
        }
        console.log("Datos: ", data)
        axiosInstance.post("user/follow", data)
            .then(res => {
                console.log("Amigo agregado ", res.data)
                this.getFriends()
            })
            .catch(error => {
                console.log("Error agregando amigo", error)
            })
    }

    componentDidMount() {
        this.getFriends();
        this.getAllUsers();
    }

    render() {

        const addFriend = () => {
            if (this.state.users != null) {
                return (
                    <div id="add-friend-div">
                        <Form.Control as="Select" onChange={this.handleSelectedFriendChange} >
                            {this.state.users.map(user => (
                                <option value={user.username}>{user.username}</option>
                            ))}
                        </Form.Control>
                        <Button variant="primary" onClick={this.handleAddFriend} >
                            Seguir
                        </Button>
                    </div>
                )
            }
        }

        const showFriends = () => {
            const friends = this.state.friends
            if (friends != null) {
                return (
                    <div>
                        {friends.map(friend => (
                            <Friend {...friend}></Friend>
                        ))}
                    </div>
                )
            }
        }

        

        return (
            <div id="main-friend-div">
                {addFriend()}
                {showFriends()}
            </div>
        )
    }
}