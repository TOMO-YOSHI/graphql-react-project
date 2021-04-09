import React, { Component } from 'react';
import { JobList } from './JobList';
// import { companies } from './fake-data';
import { loadCompany } from './requests';

export class CompanyDetail extends Component {
  constructor(props) {
    super(props);
    // const {companyId} = this.props.match.params;
    // this.state = {company: companies.find((company) => company.id === companyId)};
    const {companyId} = this.props.match.params;
    this.state = {company: null}
  }

  async componentDidMount(){
    const { companyId } = this.props.match.params;
    const company = await loadCompany(companyId);
    this.setState({company});
  }

  render() {
    const {company} = this.state;
    if(!company) {
      return null;
    }
    return (
      <div>
        <h1 className="title">{company.name}</h1>
        <div className="box">{company.description}</div>
        <h5 className="title is-5">Jobs at {company.name}</h5>
        <JobList jobs={company.jobs} />
      </div>
    );
  }
}
