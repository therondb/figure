import * as React from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { removeFormAndRedirect } from '../../actions/forms';

const mapStateToProps = (state: any) => {
  return state;
}

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    onRemove: (id: string) => {
      dispatch(removeFormAndRedirect(id));
    },
  }
}

@connect(mapStateToProps, mapDispatchToProps)
export class ShowForm extends React.Component<any, any> {
  render() {
    const { params, onRemove } = this.props;

    return (
      <div>
        { params.formId }
        <button onClick={() => onRemove(params.formId)}>Remove</button>
      </div>
    );
  }
}
