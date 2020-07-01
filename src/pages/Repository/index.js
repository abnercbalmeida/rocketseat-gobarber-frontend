import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import api from '../../services/api';

import { Loading, Owner, IssueList, Filter, Pagination } from './styles';

import Container from '../../components/Container';

export default class Repository extends Component {
  // eslint-disable-next-line react/static-property-placement
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        repository: PropTypes.string,
      }),
    }).isRequired,
  };

  state = {
    repository: {},
    issues: [],
    loading: true,
    issuesPerPage: 5,
    page: 1,
    issueState: 'open',
  };

  componentDidMount() {
    this.componentDidUpdate();
  }

  componentDidUpdate(_, prevState) {
    const { issueState, page } = this.state;

    if (
      !prevState ||
      issueState !== prevState.issueState ||
      page !== prevState.page
    )
      this.getRepositoryData();
  }

  getRepositoryData = async () => {
    const { match } = this.props;

    const { issueState, issuesPerPage, page } = this.state;

    const repoName = decodeURIComponent(match.params.repository);

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state: issueState,
          per_page: issuesPerPage,
          page,
        },
      }),
    ]);

    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
    });
  };

  handleIssueStateChange = e => {
    this.setState({
      issueState: e.target.value,
    });
  };

  handlePrevPage = () => {
    const { page } = this.state;

    this.setState({
      page: page <= 1 ? 1 : page - 1,
    });
  };

  handleNextPage = () => {
    const { page } = this.state;

    this.setState({
      page: page + 1,
    });
  };

  render() {
    const { repository, issues, loading, page } = this.state;

    if (loading) {
      return <Loading>Carregando</Loading>;
    }

    return (
      <Container>
        <Owner>
          <Link to="/">Voltar aos repositórios</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>
        <Filter>
          <select onChange={this.handleIssueStateChange}>
            <option value="open">Open issues</option>
            <option value="closed">Closed issues</option>
            <option value="all">All issues</option>
          </select>
        </Filter>
        <IssueList>
          {issues.map(issue => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a href={issue.html_url}>{issue.title}</a>
                  {issue.labels.map(label => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </IssueList>
        <Pagination>
          <button
            type="button"
            disabled={page === 1}
            onClick={this.handlePrevPage}
          >
            Anterior
          </button>
          <button type="button" onClick={this.handleNextPage}>
            Próxima
          </button>
        </Pagination>
      </Container>
    );
  }
}
