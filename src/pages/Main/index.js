import React, { Component } from 'react';

import { FaGitAlt, FaPlus, FaSpinner } from 'react-icons/fa';

import { Link } from 'react-router-dom';

import api from '../../services/api';

import { Form, SubmitButton, List } from './styles';

import Container from '../../components/Container';

export default class Main extends Component {
  state = {
    newRepo: '',
    repositories: [],
    loading: false,
    error: false,
  };

  // Carregar os dados do localStorage
  componentDidMount() {
    const repositories = localStorage.getItem('repositories');

    if (repositories) {
      this.setState({ repositories: JSON.parse(repositories) });
    }
  }

  // Salvar os dados do localStorage
  componentDidUpdate(_, prevState) {
    const { repositories } = this.state;

    if (prevState.repositories !== repositories) {
      localStorage.setItem('repositories', JSON.stringify(repositories));
    }
  }

  handleInputChange = e => {
    this.setState({ newRepo: e.target.value });
  };

  handleSubmit = async e => {
    e.preventDefault();

    this.setState({ loading: true });

    const { newRepo, repositories } = this.state;

    try {
      if (repositories.filter(({ name }) => name === newRepo))
        throw new Error('Repositório duplicado');

      const response = await api.get(`/repos/${newRepo}`);

      const data = {
        name: response.data.full_name,
      };

      this.setState({
        repositories: [...repositories, data],
        newRepo: '',
        loading: false,
        error: false,
      });
    } catch {
      this.setState({
        error: true,
        loading: false,
      });
    }
  };

  render() {
    const { newRepo, repositories, loading, error } = this.state;

    return (
      <Container>
        <h1>
          <FaGitAlt />
          Repositórios
        </h1>

        <Form onSubmit={this.handleSubmit} error={error ? 1 : 0}>
          <input
            type="text"
            placeholder="Adicionar repositório"
            value={newRepo}
            onChange={this.handleInputChange}
          />
          <SubmitButton loading={loading ? 1 : 0}>
            {loading ? (
              <FaSpinner color="#FFF" size={14} />
            ) : (
              <FaPlus color="#FFF" size={14} />
            )}
          </SubmitButton>
        </Form>

        <List>
          {repositories.map(({ name }) => (
            <li key={name}>
              <span>{name}</span>
              <Link to={`/repository/${encodeURIComponent(name)}`}>
                Detalhes
              </Link>
            </li>
          ))}
        </List>
      </Container>
    );
  }
}
