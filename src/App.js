import logo from "./logo.svg";
import "./App.css";
import React from "react";
import web3 from "./web3";
import lottery from "./lottery";

class App extends React.Component {
  state = {
    manager: '',
    players: [],
    balance: '',
    value: '',
    message: '',
    currentUser: ''
  };

  async componentDidMount() {
    const manager = await lottery.methods.manager().call();
    const players = await lottery.methods.getPlayers().call();
    const balance = await web3.eth.getBalance(lottery.options.address);
    const accounts = await web3.eth.getAccounts();
    const currentUser = accounts[0];

    this.setState({ manager, players, balance, currentUser });
  }

  onSubmit = async (event) => {
    event.preventDefault();

    this.setState({ message: 'Waiting to enter you in'});

    if (this.state.value >= 0.001) {
      await lottery.methods.enter().send({
        from: this.state.currentUser,
        value: web3.utils.toWei(this.state.value, 'ether')
      });
  
      this.update();

      this.setState({ message: 'You have been entered', value: ''});
    } else {
      this.update();

      this.setState({ message: 'Minimum to join is 0.001 ether', value: ''});
    }
  };

  onClick = async () => {
    this.setState({ message: 'The lottery is picking a winner'});

    await this.update();

    if (this.state.players.length > 0) {
      await lottery.methods.pickWinner().send({
        from: this.state.currentUser
      });

      const lastWinner = await lottery.methods.lastWinner().call();
  
      this.update();
  
      this.setState({ message: 'The winner is ' + lastWinner});
    } else {
      this.update();

      this.setState({ message: 'No one is currently joining the lottery'});
    }
  };

  update = async () => {
    const players = await lottery.methods.getPlayers().call();
    const balance = await web3.eth.getBalance(lottery.options.address);

    this.setState({ players, balance });
  }

  render() {
    return (
      <div class="center">
        <h2>Lottery Contract</h2>
        <p>This contract is managed by {this.state.manager}.</p>
        <p>There are currently {this.state.players.length} people entered.</p>
        <p>Winning pool is {web3.utils.fromWei(this.state.balance, 'ether')} Ether.</p>

        <br></br>

        <form onSubmit={this.onSubmit}>
          <h4>Want to try your luck?</h4>
          <div>
            <label>Amount of ether to enter </label>
            <input
              value={this.state.value}
              onChange={event => this.setState({ value: event.target.value })}
            />
            <button class="margin-left">Enter</button>
            <br></br>
            <br></br>
            <label>(Minimum to enter is 0.001 ether)</label>
          </div>
        </form>
        
        <br></br>

        {this.state.currentUser === this.state.manager &&
          <div>
            <h4>Ready to pick a winner?</h4>
            <button onClick={this.onClick}>Pick a winner</button>
          </div>
        }

        <br></br>

        <h1>{this.state.message}</h1>
      </div>
    );
  }
}

export default App;
