import { IFieldInfo } from '@pnp/sp/fields/types';
import { IFieldSchema } from '../../../common/services/datatypes/RenderListData';

export interface IListFormState {
  isLoadingSchema: boolean;
  isLoadingData: boolean;
  isSaving: boolean;
  fieldsSchema?: IFieldSchema[];
  // formFields: IFieldInfo[];
  data: any;
  originalData: any;
  errors: string[];
  notifications: string[];
  fieldErrors: { [fieldName: string]: string };
  showUnsupportedFields?: boolean;
  hasError: boolean;
  errorInfo: string;
}
