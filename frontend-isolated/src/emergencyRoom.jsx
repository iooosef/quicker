import React, { useEffect, useState, useRef } from 'react';
import './inventory.css'; 
import quicker from "./assets/quicker.png";
import { useNavigate } from 'react-router-dom';
import { useConfig } from './util/ConfigContext';
import { useUser } from './auth/UserContext';
import secureFetch from './auth/SecureFetch';
import Signature from '@lemonadejs/signature/dist/react';
import CheckboxGroup from './util/CheckBoxGroup';
import AdmissionInfo from './AdmissionInfo';

function AddItem({ refreshAdmissions }) {
  const { serverUrl } = useConfig();
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState({});
  const [bedLocs, setBedLocs] = useState([]);
  const [bedLoading, setBedLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateModel = () => {
    const foundErrors = validateNewAdmissionModel(model);
    setErrors(foundErrors);
    return Object.keys(foundErrors).length === 0;
  };

  const AddAdmission = (e) => {
    e.preventDefault();
    if (!serverUrl) return;
    if (!validateModel()) return;
    setLoading(true)

    const now = new Date();
    const status = model.patientBedLocCode === 'LOC000' ? 'pre-admission' : 'admitted-ER';
    const payload = {
      patientName: model.patientName,
      patientTriage: model.patientTriage,
      patientStatus: status,
      patientBedLocCode: model.patientBedLocCode,
      patientAdmitOn: now.toISOString(),
      patientERCause: model.patientERCause
    };

    secureFetch(`${serverUrl}/patient-admissions/admission`, 
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: 'include',
      body: JSON.stringify(payload)
    })
    .then(async (response) => {
      const responseBody = await response.json()
      console.log(response)
      if(response.status !== 200) {
        console.log(responseBody);
        const errorString = responseBody.map((error) => error.message).join('\n');
        alert(errorString);
      } else {        
        alert(`Successfully added new patient admission.`);
        refreshAdmissions();
        setModel({
          patientTriage: '',
          patientName: '',
          patientBedLocCode: '',
          patientERCause: ''
        });
      }
    })
    .catch(error => console.error(error)).finally(() => {
      setLoading(false)
    })
  }

  const getActiveBedLocs = () => {
    if (!serverUrl) return;
    setBedLoading(true)
    secureFetch(`${serverUrl}/beds/search?` + new URLSearchParams({
      query: 'available',
      page: 0,
      size: 50
    }).toString(), 
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: 'include',
    })
    .then(response => response.json())
    .then(data => {
      setBedLocs(data)
    })
    .catch(error => console.error(error)).
    finally(() => {
      setBedLoading(false)
    })    
  }
  useEffect(() => {
    getActiveBedLocs();
  }, []);

  return (
    <div className="add-item-container">
      <h4 className="text-2xl mb-2">Admit a patient</h4>
      <form onSubmit={AddAdmission}>
        <div className="table-container">
          <table>
            <tbody>
              <tr className='flex gap-2 pt-2'>
                
                <td className='flex-none max-w-20'>                  
                  <label>
                    <div className="label hidden">
                      <span className="label-text-alt"></span>
                    </div>
                    <div className="form-control">
                      <select type="text" name='patientTriage' placeholder='' 
                        className={"select input-floating peer " + 
                          (errors.patientTriage && "is-invalid")}
                          onChange={e => setModel(
                            prev => ({...prev, patientTriage: e.target.value})
                          )} >
                        <option value=''></option>
                        <option value='1'>1</option>
                        <option value='2'>2</option>
                        <option value='3'>3</option>
                        <option value='4'>4</option>
                        <option value='5'>5</option>
                      </select>
                      <span className="input-floating-label">Triage</span>
                    </div>
                    <div className="label">
                      {errors.patientTriage && (
                        <span className="label-text-alt">{errors.patientTriage}</span>
                      )}
                    </div>
                  </label>
                </td>
                
                <td className='flex-1'>                  
                  <label>
                    <div className="label hidden">
                      <span className="label-text-alt"></span>
                    </div>
                    <div className="form-control">
                      <input type="text" name='patientName' placeholder='' 
                        className={"input input-floating peer " + 
                          (errors.patientName && "is-invalid")}
                          onChange={e => setModel(
                            prev => ({...prev, patientName: e.target.value})
                          )} />
                      <span className="input-floating-label">Name</span>
                    </div>
                    <div className="label">
                      {errors.patientName && (
                        <span className="label-text-alt">{errors.patientName}</span>
                      )}
                    </div>
                  </label>
                </td>

                <td className='flex-none max-w-32'>                  
                  <label>
                    <div className="label hidden">
                      <span className="label-text-alt"></span>
                    </div>
                    <div className="form-control">
                      <input type="text" list='bedLocOptions' name='patientBedLocCode' placeholder='' 
                        className={"input input-floating peer " + 
                          (errors.patientBedLocCode && "is-invalid")}
                          onChange={e => setModel(
                            prev => ({...prev, patientBedLocCode: e.target.value})
                          )} />
                        <datalist id="bedLocOptions">                          
                          <option value='LOC000'>unassigned</option>
                          {bedLocs.content && bedLocs.content.map((item) => (
                            <option key={item.bedLocCode} value={item.bedLocCode}>{item.bedLocCode}</option>
                          ))}
                        </datalist>
                      <span className="input-floating-label">Bed Location</span>
                    </div>
                    <div className="label">
                      {errors.patientBedLocCode && (
                        <span className="label-text-alt">{errors.patientBedLocCode}</span>
                      )}
                    </div>
                  </label>
                </td>
                
                <td className='flex-1'>                  
                  <label>
                    <div className="label hidden">
                      <span className="label-text-alt"></span>
                    </div>
                    <div className="form-control">
                      <input type="text" name='patientERCause' placeholder='' 
                        className={"input input-floating peer " + 
                          (errors.patientERCause && "is-invalid")} 
                          onChange={e => setModel(
                            prev => ({...prev, patientERCause: e.target.value})
                          )} />
                      <span className="input-floating-label">Admission Cause</span>
                    </div>
                    <div className="label">
                      {errors.patientERCause && (
                        <span className="label-text-alt">{errors.patientERCause}</span>
                      )}
                    </div>
                  </label>
                </td>

                <td className='flex-none !w-20'>
                  <button type="submit" className='w-full h-full'>Add</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </form>
    </div>
  );
}


function Admissions ({ showUpdateModal, 
                      showAdmissionInfoModal,
                      patientAdmissions, 
                      loading, 
                      FetchPatientAdmissions, 
                      setQuery, 
                      currentPage, 
                      setCurrentPage,
                      itemsPerPage}) {  

  const refreshAdmissions = () => {
    FetchPatientAdmissions(); 
  };

  const NextPage = () => {
    if (currentPage < patientAdmissions.totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  }

  const PreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  }

  const Search = () => {
    setQuery(document.getElementById('searchInput').value);
    setCurrentPage(0);
  }


  return (
    <div className="inventory-container">

      <h4 className="text-2xl mb-2">Emergency Room Admissions</h4>

      {/* Search Bar */}
      
        <div className='flex gap-4'>
          <input
            type="text"
            className="w-full "
            id="searchInput"
            placeholder="Search ER Admissions"
          />
          <button onClick={Search} className="btn btn-primary h-full !px-8">Search</button>
        </div>
      

      {/* Admissions Table */}
      <table>
        <thead>
          <tr>
            <th>id</th>
            <th>Triage</th>
            <th>Name</th>
            <th>Bed Location</th>
            <th>Status</th>
            <th className='!text-center'>Actions</th>
          </tr>
        </thead>
        {loading ? (
          <tbody>
            <tr>
              <td colSpan="5">Loading...</td>
            </tr>
          </tbody>
        ) : (
          <tbody>
            {patientAdmissions?.content?.map((item) => (
              <tr key={item.id}>
                <td className='text-black'>{item.id}</td>
                <td className='text-black'>
                  <span className={"badge badge-solid " + 
                    (item.patientTriage === 1 ? 'badge-error' 
                      : item.patientTriage === 2 ? 'badge-warning'
                      : item.patientTriage === 3 ? '!bg-yellow-200'
                      : item.patientTriage === 4 ? 'badge-success'
                      : item.patientTriage === 5 ? 'badge-accent'
                      : 'badge-neutral')
                  }> {item.patientTriage} </span>
                </td>
                
                <td className='text-black'>{item.patientName}</td>
                <td className='text-black'>{item.patientBedLocCode}</td>
                <td className='text-black'>
                  <span className={"badge badge-solid " + 
                    (item.patientStatus === 'pre-admission' ? 'badge-warning'
                      : item.patientStatus === 'in-surgery' ? 'badge-error'
                      : item.patientStatus === 'admitted-ER' ? 'badge-success'
                      : item.patientStatus.includes('pending-pay') ? 'badge-accent'
                      : (item.patientStatus === 'paid' || item.patientStatus === 'collateralized') ? 'badge-info'
                      : 'badge-neutral')
                  }> {item.patientStatus} </span>

                </td>
                <td className='text-black flex justify-center gap-2'>
                  <button type="button" onClick={() => showUpdateModal(item.id)} className='btn btn-soft btn-secondary !p-2 min-h-fit !h-fit'>
                    <span className="icon-[tabler--pencil] text-neutral-500"></span>
                  </button>
                  <button type="button" onClick={() => showAdmissionInfoModal(item.id)} className='btn btn-soft btn-secondary !p-1 min-h-fit !h-fit'>
                    <span className="icon-[tabler--info-circle] text-neutral-500 size-6"></span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        )}
      </table>
      {/* Pagination Controls */}
      {
        !loading && patientAdmissions?.pageable ? (
          <div className="pagination-controls">
            <button 
              onClick={PreviousPage} 
              disabled={currentPage === 0}
            >
              Previous
            </button>
            <span className='text-black'>
              Page {currentPage + 1} of {patientAdmissions.totalPages}
            </span>
            <button 
              onClick={NextPage} 
              disabled={currentPage === patientAdmissions.totalPages}
            >
              Next
            </button>
          </div>
        ) : null
      }

    </div>
  );
};

function Modal({ id, closeModal, refreshTable, showAssignPatientIDModal, showConsentModal, showMedicalRecordModal }) {
  const { serverUrl } = useConfig();
  const [loading, setLoading] = useState(false)
  const [model, setModel] = useState({});
  const [errors, setErrors] = useState({});
  const [hasConsent, setHasConsent] = useState(false);
  const [hasMedicalRecord, setHasMedicalRecord] = useState(false);

  const validateModel = () => {
    const foundErrors = validateAdmissionModel(model);
    setErrors(foundErrors);
    return Object.keys(foundErrors).length === 0;
  };

  const FetchAdmission = () => {
    if (!serverUrl) return;
    setLoading(true)
    secureFetch(`${serverUrl}/patient-admissions/${id}`, 
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: 'include',
    })
    .then(response => response.json())
    .then(data => setModel(data))
    .catch(error => console.error(error)).
    finally(() => {
      setLoading(false)
    })
  }

  const UpdateModel = () => {
    if (!serverUrl) return;
    console.log(`!validateModel(): ${!validateModel()}`)
    console.log(errors)
    if (!validateModel()) return;
    setLoading(true)

    const payload = {
      id: model.id,
      patientID: model.patientID,
      patientName: model.patientName,
      patientTriage: model.patientTriage,
      patientStatus: model.patientStatus,
      patientBedLocCode: model.patientBedLocCode,
      patientAdmitOn: model.patientAdmitOn,
      patientOutOn: model.patientOutOn,
      patientERCause: model.patientERCause,
    };

    secureFetch(`${serverUrl}/patient-admissions/admission/${id}`, 
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: 'include',
      body: JSON.stringify(payload)
    })
    .then(async (response) => {
      const responseBody = await response.json()
      console.log(response)
      if(response.status !== 200) {
        console.log(responseBody);
        const errorString = responseBody.map((error) => error.message).join('\n');
        alert(errorString);
      } else {        
        refreshTable();
        closeModal();
      }
    })
    .catch(error => console.error(error)).
    finally(() => {
      setLoading(false)
    })
  }

  const admissionConsentExist = () => {    
    if (!serverUrl) return;
    setLoading(true);

    secureFetch(`${serverUrl}/patient-consents/${id}?` + new URLSearchParams({
      admissionId: id
    }).toString(), 
    {
      method: "GET",
      headers: { "Content-Type": "application/json"},
      credentials: 'include'
    })
    .then(async (response) => {
      if(response.status === 200) {
        setHasConsent(true);
      } else {        
        setHasConsent(false);
      }
    })
    .catch(error => console.error(error)).
    finally(() => {
      setLoading(false);
    });
  }

  const medicalRecordExist = () => {
    if (!serverUrl) return;
    setLoading(true);
    secureFetch(`${serverUrl}/patients-medical-info/${model.patientID}?`, 
    {
      method: "GET",
      headers: { "Content-Type": "application/json"},
      credentials: 'include'
    })
    .then(async (response) => {
      if(response.status === 200) {
        setHasMedicalRecord(true);
      } else {        
        setHasMedicalRecord(false);
      }
    })
    .catch(error => console.error(error)).
    finally(() => {
      setLoading(false);
    });
  }

  useEffect(() => {
    FetchAdmission();
    admissionConsentExist();
  }, [id]);
  useEffect(() => {
    if (model.patientID) {
      medicalRecordExist();
    }
  }, [model]);

  return (
    <div className='qe-modal-overlay'>      
        { loading ? (
          <span>Loading...</span>
          ) : (
            <div className="qe-modal gap-4 !w-fit !max-w-fit" style={{ display: 'flex' }}>   
              <h4 className="text-2xl mb-2">Admission No. {model.id}</h4>
              
              <div className='w-full gap-4 flex'>
                <label className="input-group w-full max-w-full">
                  <span className="input-group-text font-bold uppercase text-nowrap">Patient ID</span>
                  <input type="text" className="input grow !text-black" value={model.patientID || ""} disabled readOnly/>
                </label>
                
                <label className="input-group w-full max-w-full">
                  <span className="input-group-text font-bold uppercase text-nowrap">Triage</span>
                  <select className="select grow !text-black" value={model.patientTriage}
                  onChange={(e) => setModel((prev) => ({
                    ...prev,
                    patientTriage: parseInt(e.target.value)
                  }))}
                  disabled={isPatientOutOfER(model.patientStatus)} readOnly={isPatientOutOfER(model.patientStatus)} >
                    <option value=''>Select a triage level</option>
                    <option value='1'>1</option>
                    <option value='2'>2</option>
                    <option value='3'>3</option>
                    <option value='4'>4</option>
                    <option value='5'>5</option>
                  </select>
                </label>
              </div>
                
              <label className="input-group w-full max-w-full">
                <span className="input-group-text font-bold uppercase text-nowrap">Name</span>
                <input type="text" className="input grow !text-black" value={model.patientName} 
                onChange={(e) => setModel((prev) => ({
                  ...prev,
                  patientName: e.target.value
                }))}
                disabled={isPatientOutOfER(model.patientStatus)} readOnly={isPatientOutOfER(model.patientStatus)} />
              </label>

              <div className='w-full gap-4 flex'>
                <label className="input-group w-full max-w-full">
                  <span className="input-group-text font-bold uppercase text-nowrap">Bed Location Code</span>
                  <input type="text" className="input grow !text-black" value={model.patientBedLocCode} 
                  onChange={(e) => setModel((prev) => ({
                    ...prev,
                    patientBedLocCode: e.target.value
                  }))}
                  disabled={isPatientOutOfER(model.patientStatus)} readOnly={isPatientOutOfER(model.patientStatus)} />
                </label>
                <label className="input-group w-full max-w-full">
                  <span className="input-group-text font-bold uppercase text-nowrap">Status</span>
                  {isPatientOutOfER(model.patientStatus) ? (
                    <input
                      className="input grow !text-black"
                      value={model.patientStatus}
                      disabled
                      readOnly
                    />
                  ) : (
                    <select
                      className="select grow !text-black"
                      value={model.patientStatus}
                      onChange={(e) => {
                        // Handle the change here
                        console.log(e.target.value);
                      }}
                    >
                      <option value="">Select a status</option>
                      <option value="pre-admission">Pre-admission</option>
                      <option value="in-surgery">Under Surgery</option>
                      <option value="admitted-ER">Admitted to ER</option>
                      <option value="pending-pay-to-discharge">Pending Pay for Discharge</option>
                      <option value="pending-pay-to-transfer">Pending Pay for Transfer</option>
                      <option value="to-morgue">Deceased (To Morgue)</option>
                      <option value="to-ward">To Hospital Ward</option>
                    </select>
                  )}
                </label>
              </div>

              <div className='w-full gap-4 flex'>
                <label className="input-group w-full max-w-full">
                  <span className="input-group-text font-bold uppercase text-nowrap">Admitted On</span>
                  <input type="datetime-local" className="input grow !text-black" value={formateDateForInputDateTime (model.patientAdmitOn) || ""} disabled readOnly/>
                </label>
                
                <label className="input-group w-full max-w-full">
                  <span className="input-group-text font-bold uppercase text-nowrap">Discharged/Transferred On</span>
                  <input type="datetime-local" className="input grow !text-black" value={formateDateForInputDateTime (model.patientOutOn) || ""} disabled readOnly/>
                </label>
              </div>
                
              <label className="input-group w-full max-w-full">
                <span className="input-group-text font-bold uppercase text-nowrap">ER Admission Cause</span>
                <input type="text" className="input grow !text-black" value={model.patientERCause}
                onChange={(e) => setModel((prev) => ({
                  ...prev,
                  patientERCause: e.target.value
                }))}
                disabled={isPatientOutOfER(model.patientStatus)} readOnly={isPatientOutOfER(model.patientStatus)} />
              </label>
              {!model.patientID &&
                <button onClick={() => showAssignPatientIDModal(model.id)} className="btn btn-accent">Assign Patient ID</button>
              }
              {model.patientID && !isPatientOutOfER(model.patientStatus) && !hasConsent &&
                <button onClick={() => showConsentModal(model.id)} className="btn btn-accent">Sign Informed Consent</button>
              }
              {model.patientID && !isPatientOutOfER(model.patientStatus) && !hasMedicalRecord &&
                <button onClick={() => showMedicalRecordModal(model.patientID)} className="btn btn-accent">Add Medical Record</button>
              }
              {!isPatientOutOfER(model.patientStatus) &&
                <button onClick={UpdateModel} className="btn btn-primary">Update</button>
              }
              <button onClick={closeModal} className="btn btn-secondary">Close</button>
            </div>
        )}
    </div>
  );
};

function PatientRecordModal( {admissionID, patientID, closeModal} ) {
  const { serverUrl } = useConfig();
  const [loading, setLoading] = useState(false)
  const [model, setModel] = useState({});
  const [admissionModel, setAdmissionModel] = useState({});
  const [errors, setErrors] = useState({});
  
  const validateModel = () => {
    const foundErrors = validatePatientModel(model);
    setErrors(foundErrors);
    return Object.keys(foundErrors).length === 0;
  };

  const FetchPatient = () => {
    if (!serverUrl) return;
    setLoading(true)
    secureFetch(`${serverUrl}/patients/${(patientID)}`, 
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: 'include',
    })
    .then(response => response.json())
    .then(data => setModel(data))
    .catch(error => console.error(error)).
    finally(() => {
      setLoading(false)
    })
  }

  const UpdateModel = () => {
    if (!serverUrl) return;
    if (!validateModel()) return;
    setLoading(true)

    const patientPayload = { 
      id: model.id,
      patientFullName: model.patientFullName,
      patientGender: model.patientGender,
      patientDOB: ensureDateIsInstantSerializable(model.patientDOB),
      patientAddress: model.patientAddress,
      patientContactNum: model.patientContactNum,
      patientEmergencyContactName: model.patientEmergencyContactName,
      patientEmergencyContactNum: model.patientEmergencyContactNum,
      patientPWDID: model.patientPWDID,
      patientSeniorID: model.patientSeniorID
    };
    
    secureFetch(`${serverUrl}/patients/patient/${patientID}`, 
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: 'include',
      body: JSON.stringify(patientPayload)
    })
    .then(async (response) => {
      const responseBody = await response.json()
      console.log(response)
      if(response.status !== 200) {
        console.log(responseBody);
        const errorString = responseBody.map((error) => error.message).join('\n');
        alert(errorString);
      } else {
        alert(`Successfully updated Patient Record`);
        updateAdmissionPatientID();
      }
    })
    .catch(error => console.error(error)).
    finally(() => {
      setLoading(false)
    })

  };

  const updateAdmissionPatientID = () => {  
    const admissionPayload = {
      id: admissionID,
      patientID: patientID,
      patientName: null,
      patientTriage: null,
      patientStatus: null,
      patientBedLocCode: null,
      patientAdmitOn: null,
      patientOutOn: null,
      patientERCause: null
    };
    secureFetch(`${serverUrl}/patient-admissions/admission/patientID/${admissionID}`, 
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(admissionPayload)
      })
      .then(async (response) => {
        const responseBody = await response.json()
        console.log(response)
        if(response.status !== 200) {
          console.log(responseBody);
          const errorString = responseBody.map((error) => error.message).join('\n');
          alert(errorString);
        } else {        
          alert(`Successfully assigned Patient Record No. ${patientID} to Admission No. ${admissionID}`);
          closeModal();
        }
      })
      .catch(error => console.error(error)).
      finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    FetchPatient();
  }, [patientID]);

  return (
    <div className='qe-modal-overlay'>   
      { loading ? (
          <span>Loading...</span>
          ) : (
            <div className="qe-modal gap-4 !w-fit !max-w-fit" style={{ display: 'flex' }}>   
              <h4 className="text-2xl mb-2">Patient No. {patientID}</h4>

              <div className='w-full form-control'>
                <label className="input-group w-full max-w-full">
                  <span className={"input-group-text font-bold uppercase text-nowrap " + 
                    (errors.patientFullName && "text-error")
                  }>Full Name</span>
                  <input type="text" className={"input grow !text-black " + 
                    (errors.patientFullName && "is-invalid text-error")
                  } value={model.patientFullName || ""} 
                  onChange={e => setModel((prev) => ({
                    ...prev,
                    patientFullName: e.target.value
                  }))}/>
                </label>
                {errors.patientFullName && (
                  <div className="label">
                    <span className="label-text-alt text-error">{errors.patientFullName}</span>
                  </div>
                  )} 
              </div>
              
              <div className='w-full gap-4 flex'>
                <div className='w-full form-control'>                    
                  <label className="input-group w-full max-w-full">
                    <span className={"input-group-text font-bold uppercase text-nowrap " + 
                    (errors.patientGender && "text-error")}>Gender</span>
                    <select
                      className={"w-full select grow " + 
                        (errors.patientGender && "is-invalid text-error")}
                      value={model.patientGender || ""}
                      onChange={e =>
                        setModel(prev => ({
                          ...prev,
                          patientGender: e.target.value
                        }))
                      }>
                      <option value="" disabled>Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </label>
                  {errors.patientGender && (
                    <div className="label">
                      <span className="label-text-alt text-error">{errors.patientGender}</span>
                    </div>
                  )} 
                </div>

                <label className="input-group w-full max-w-full">
                  <span className="input-group-text font-bold uppercase text-nowrap">Birthdate</span>
                  <input type="date" className="input grow !text-black" value={formatDateForInputDate (model.patientDOB) || ""} 
                  onChange={e => setModel((prev) => ({
                    ...prev,
                    patientDOB: e.target.value
                  }))}/>
                </label>
              </div>

              <label className="input-group w-full max-w-full">
                <span className="input-group-text font-bold uppercase text-nowrap">Address</span>
                <input type="text" className="input grow !text-black" value={model.patientAddress || ""} 
                  onChange={e => setModel((prev) => ({
                    ...prev,
                    patientAddress: e.target.value
                  }))}/>
              </label>

              <label className="input-group w-full max-w-full">
                <span className="input-group-text font-bold uppercase text-nowrap">Contact Number</span>
                <input type="text" className="input grow !text-black" value={model.patientContactNum || ""} 
                  onChange={e => setModel((prev) => ({
                    ...prev,
                    patientContactNum: e.target.value
                  }))}/>
              </label>
              
              <div className='w-full gap-4 flex'>
                <label className="input-group w-full max-w-full">
                  <span className="input-group-text font-bold uppercase text-nowrap">Emergency Contact</span>
                  <input type="text" className="input grow !text-black" value={model.patientEmergencyContactName || ""} 
                  onChange={e => setModel((prev) => ({
                    ...prev,
                    patientEmergencyContactName: e.target.value
                  }))}/>
                </label>

                <label className="input-group w-full max-w-full">
                  <span className="input-group-text font-bold uppercase text-nowrap">Emergency Contact Number</span>
                  <input type="text" className="input grow !text-black" value={model.patientEmergencyContactNum || ""} 
                  onChange={e => setModel((prev) => ({
                    ...prev,
                    patientEmergencyContactNum: e.target.value
                  }))}/>
                </label>
              </div>
              
              <div className='w-full gap-4 flex'>
                <label className="input-group w-full max-w-full">
                  <span className="input-group-text font-bold uppercase text-nowrap">PWD ID</span>
                  <input type="text" className="input grow !text-black" value={model.patientPWDID || ""} 
                  onChange={e => setModel((prev) => ({
                    ...prev,
                    patientPWDID: e.target.value
                  }))}/>
                </label>

                <label className="input-group w-full max-w-full">
                  <span className="input-group-text font-bold uppercase text-nowrap">Senior Citizen ID</span>
                  <input type="text" className="input grow !text-black" value={model.patientSeniorID || ""} 
                  onChange={e => setModel((prev) => ({
                    ...prev,
                    patientSeniorID: e.target.value
                  }))}/>
                </label>
              </div>
              
              <button onClick={UpdateModel} className="btn btn-primary">Update then Assign this Patient Record to Admission No. {admissionID}</button>
              <button onClick={closeModal} className="btn btn-secondary">Close</button>
            </div>
      )}
    </div>
  )


}

function AssignPatientIDModal( {admissionID, closeModal, refreshTable, showAssignPatientIDModal, showNewPatientModal} ) {
  const { serverUrl } = useConfig();
  const [loading, setLoading] = useState(false)
  const [patients, setPatients] = useState({});
  const [query, setQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const FetchPatients = () => {
    if (!serverUrl) return;
    setLoading(true)
    secureFetch(`${serverUrl}/patients/search?` + new URLSearchParams({
      query: query,
      page: currentPage,
      size: itemsPerPage
    }).toString(), 
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: 'include',
    })
    .then(response => response.json())
    .then(data => {
      setPatients(data)
      console.log(data)
    })
    .catch(error => console.error(error)).
    finally(() => {
      setLoading(false)
    })
  }

  useEffect(() => {
    FetchPatients();
  }
  , [query, currentPage, itemsPerPage, serverUrl]);

  const NextPage = () => {
    if (currentPage < patients.totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  }

  const PreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  }

  const PatientSearch = () => {
    console.log(document.getElementById('patientSearchInput').value)
    setQuery(document.getElementById('patientSearchInput').value);
    setCurrentPage(0);
  }

  return (
    <div className='qe-modal-overlay'>     
    { loading ? (
      <span>Loading...</span>
      ) : (
        <div className="qe-modal gap-4 !w-fit !max-w-fit flex">
          <div className="inventory-container">
            <h4 className="text-2xl mb-2">Select Patient Record for Admission No. {admissionID}</h4>
            {/* Search Bar */}
              <div className='flex gap-4'>
                <input
                  type="text"
                  className="w-full "
                  id="patientSearchInput"
                  placeholder="Search Patient Records"
                  defaultValue={query}
                />
                <button onClick={PatientSearch} className="btn btn-primary h-full !px-8">Search</button>
              </div>

            {/* Patient Table */}
            <table>
              <thead>
                <tr>
                  <th>id</th>
                  <th>FullName</th>
                  <th>Gender</th>
                  <th>Birth Date</th>
                  <th>Address</th>
                  <th className='!text-center'>Actions</th>
                </tr>
              </thead>
              {loading ? (
                <tbody>
                  <tr>
                    <td colSpan="5">Loading...</td>
                  </tr>
                </tbody>
              ) : (
                <tbody>
                  {patients?.content?.map((item) => (
                    <tr key={item.id}>
                      <td className='text-black'>{item.id}</td>
                      <td className='text-black'>{item.patientFullName}</td>
                      <td className='text-black'>{item.patientGender}</td>
                      <td className='text-black'>{formateDateForString(item.patientDOB)}</td>
                      <td className='text-black'>{truncateLongStr(item.patientAddress, 15)}</td>
                      <td className='text-black flex justify-center'>
                        <button type="button" className='btn btn-soft btn-secondary !p-2 min-h-fit !h-fit'> {/*onClick={() => showUpdateModal(item.id)} */}
                          <span onClick={() => showAssignPatientIDModal(item.id)} className="text-neutral-500">Details</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              )}
            </table>
            {/* Pagination Controls */}
            {
              !loading && patients?.pageable ? (
                <div className="pagination-controls">
                  <button 
                    onClick={PreviousPage} 
                    disabled={currentPage === 0}
                  >
                    Previous
                  </button>
                  <span className='text-black'>
                    Page {currentPage + 1} of {patients.totalPages}
                  </span>
                  <button 
                    onClick={NextPage} 
                    disabled={currentPage === patients.totalPages}
                  >
                    Next
                  </button>
                </div>
              ) : null
            }

            </div>
            <button onClick={() => showNewPatientModal(admissionID)} className="btn btn-primary">No Record Found? Create New One</button>
          <button onClick={closeModal} className="btn btn-secondary">Close</button>
        </div>
      )
    }
    </div>
  )
}

function NewPatientModal( {admissionID, closeModal}) {
  const { serverUrl } = useConfig();
  const [loading, setLoading] = useState(false)
  const [model, setModel] = useState({});
  const [errors, setErrors] = useState({});
  
  const validateModel = () => {
    const foundErrors = validatePatientModel(model);
    setErrors(foundErrors);
    return Object.keys(foundErrors).length === 0;
  };

  const AddPatient = () => {
    if (!serverUrl) return;
    if (!validateModel()) return;
    setLoading(true)

    const patientPayload = { 
      patientFullName: model.patientFullName,
      patientGender: model.patientGender,
      patientDOB: ensureDateIsInstantSerializable(model.patientDOB),
      patientAddress: model.patientAddress,
      patientContactNum: model.patientContactNum,
      patientEmergencyContactName: model.patientEmergencyContactName,
      patientEmergencyContactNum: model.patientEmergencyContactNum,
      patientPWDID: model.patientPWDID,
      patientSeniorID: model.patientSeniorID
    };
    
    secureFetch(`${serverUrl}/patients/patient`, 
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: 'include',
      body: JSON.stringify(patientPayload)
    })
    .then(async (response) => {
      const responseBody = await response.json()
      console.log(response)
      if(response.status !== 200) {
        console.log(responseBody);
        const errorString = responseBody.map((error) => error.message).join('\n');
        alert(errorString);
      } else {
        console.log(responseBody)
        alert(`Successfully updated Patient Record for ${model.patientFullName}`);
        updateAdmissionPatientID(responseBody.id);
      }
    })
    .catch(error => console.error(error)).
    finally(() => {
      setLoading(false)
    })
  }

  const updateAdmissionPatientID = (patientID) => { 
    const admissionPayload = {
      id: admissionID,
      patientID: patientID,
      patientName: null,
      patientTriage: null,
      patientStatus: null,
      patientBedLocCode: null,
      patientAdmitOn: null,
      patientOutOn: null,
      patientERCause: null
    };
    secureFetch(`${serverUrl}/patient-admissions/admission/patientID/${admissionID}`, 
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(admissionPayload)
      })
      .then(async (response) => {
        const responseBody = await response.json()
        console.log(response)
        if(response.status !== 200) {
          console.log(responseBody);
          const errorString = responseBody.map((error) => error.message).join('\n');
          alert(errorString);
        } else {        
          alert(`Successfully assigned Patient Record No. ${patientID} to Admission No. ${admissionID}`);
          closeModal();
        }
      })
      .catch(error => console.error(error)).
      finally(() => {
        setLoading(false)
      })
  }

  return (
    <div className='qe-modal-overlay'>   
      { loading ? (
          <span>Loading...</span>
          ) : (
            <div className="qe-modal gap-4 !w-fit !max-w-fit" style={{ display: 'flex' }}>   
              <h4 className="text-2xl mb-2">New Patient Record for Admission No. {admissionID}</h4>
              
              <div className='w-full form-control'>
                <label className="input-group w-full max-w-full">
                  <span className={"input-group-text font-bold uppercase text-nowrap " + 
                    (errors.patientFullName && "text-error")
                  }>Full Name</span>
                  <input type="text" className={"input grow !text-black " + 
                    (errors.patientFullName && "is-invalid text-error")
                  } value={model.patientFullName || ""} 
                  onChange={e => setModel((prev) => ({
                    ...prev,
                    patientFullName: e.target.value
                  }))}/>
                </label>
                {errors.patientFullName && (
                  <div className="label">
                    <span className="label-text-alt text-error">{errors.patientFullName}</span>
                  </div>
                  )} 
              </div>
              
              <div className='w-full gap-4 flex'>
                <div className='w-full form-control'>                    
                  <label className="input-group w-full max-w-full">
                    <span className={"input-group-text font-bold uppercase text-nowrap " + 
                    (errors.patientGender && "text-error")}>Gender</span>
                    <select
                      className={"w-full select grow " + 
                        (errors.patientGender && "is-invalid text-error")}
                      value={model.patientGender || ""}
                      onChange={e =>
                        setModel(prev => ({
                          ...prev,
                          patientGender: e.target.value
                        }))
                      }>
                      <option value="" disabled>Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </label>
                  {errors.patientGender && (
                    <div className="label">
                      <span className="label-text-alt text-error">{errors.patientGender}</span>
                    </div>
                  )} 
                </div>

                <label className="input-group w-full max-w-full">
                  <span className="input-group-text font-bold uppercase text-nowrap">Birthdate</span>
                  <input type="date" className="input grow !text-black" value={formatDateForInputDate (model.patientDOB) || ""} 
                  onChange={e => setModel((prev) => ({
                    ...prev,
                    patientDOB: e.target.value
                  }))}/>
                </label>
              </div>

              <label className="input-group w-full max-w-full">
                <span className="input-group-text font-bold uppercase text-nowrap">Address</span>
                <input type="text" className="input grow !text-black" value={model.patientAddress || ""} 
                  onChange={e => setModel((prev) => ({
                    ...prev,
                    patientAddress: e.target.value
                  }))}/>
              </label>

              <label className="input-group w-full max-w-full">
                <span className="input-group-text font-bold uppercase text-nowrap">Contact Number</span>
                <input type="text" className="input grow !text-black" value={model.patientContactNum || ""} 
                  onChange={e => setModel((prev) => ({
                    ...prev,
                    patientContactNum: e.target.value
                  }))}/>
              </label>
              
              <div className='w-full gap-4 flex'>
                <label className="input-group w-full max-w-full">
                  <span className="input-group-text font-bold uppercase text-nowrap">Emergency Contact</span>
                  <input type="text" className="input grow !text-black" value={model.patientEmergencyContactName || ""} 
                  onChange={e => setModel((prev) => ({
                    ...prev,
                    patientEmergencyContactName: e.target.value
                  }))}/>
                </label>

                <label className="input-group w-full max-w-full">
                  <span className="input-group-text font-bold uppercase text-nowrap">Emergency Contact Number</span>
                  <input type="text" className="input grow !text-black" value={model.patientEmergencyContactNum || ""} 
                  onChange={e => setModel((prev) => ({
                    ...prev,
                    patientEmergencyContactNum: e.target.value
                  }))}/>
                </label>
              </div>
              
              <div className='w-full gap-4 flex'>
                <label className="input-group w-full max-w-full">
                  <span className="input-group-text font-bold uppercase text-nowrap">PWD ID</span>
                  <input type="text" className="input grow !text-black" value={model.patientPWDID || ""} 
                  onChange={e => setModel((prev) => ({
                    ...prev,
                    patientPWDID: e.target.value
                  }))}/>
                </label>

                <label className="input-group w-full max-w-full">
                  <span className="input-group-text font-bold uppercase text-nowrap">Senior Citizen ID</span>
                  <input type="text" className="input grow !text-black" value={model.patientSeniorID || ""} 
                  onChange={e => setModel((prev) => ({
                    ...prev,
                    patientSeniorID: e.target.value
                  }))}/>
                </label>
              </div>
              <button onClick={AddPatient} className="btn btn-primary">Add Patient Record and assign it to Admission No. {admissionID}</button>
              <button onClick={closeModal} className="btn btn-secondary">Close</button>
            </div>
          )
      }
    </div>
  )
}

function ConsentModal( {admissionID, closeModal} ) { 
  const { serverUrl } = useConfig();
  const [loading, setLoading] = useState(false)
  const [model, setModel] = useState({});
  const signatureRef = useRef(null);

  const reset = function () {
      signatureRef.current.value = [];
  };

  const AddConsent = () => {
    if (!serverUrl) return;
    setLoading(true);

    const now = new Date().toISOString();

    const payload = {
      admissionID: admissionID,
      consentSignedOn: now,
      consentSignature: signatureRef.current.getImage().replace("data:image/png;base64,", "")
    };

    secureFetch(`${serverUrl}/patient-consents/patient-consent`, 
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(payload)
      })
      .then(async (response) => {
        const responseBody = await response.json()
        console.log(response)
        if(response.status !== 200) {
          console.log(responseBody);
          const errorString = responseBody.map((error) => error.message).join('\n');
          alert(errorString);
        } else {
          console.log(responseBody)
          alert(`Signed Consent Form for Admission No. ${admissionID}`);
          closeModal();
        }
      })
      .catch(error => console.error(error)).
      finally(() => {
        setLoading(false)
      });
  }

  return (
    <div className='qe-modal-overlay'>   
      { loading ? (
          <span>Loading...</span>
          ) : (
            <div className="qe-modal gap-4 !w-full !max-w-2xl" style={{ display: 'flex' }}>   
              <h4 className="text-2xl mb-2 text-nowrap">Informed Consent Form for Admission No. {admissionID}</h4>
              <div>
                <h5 className="text-base-content/90 text-lg font-semibold">Consent Placeholder Here</h5>
                <p className="text-base-content/80 text-base">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras congue nunc a dui porttitor, at dapibus lorem gravida. Aenean vestibulum nulla et nisl semper, sed ultricies ligula volutpat. Donec non dolor vel magna blandit tincidunt eget luctus quam. Duis ut placerat lorem. Praesent sagittis ipsum arcu, sed varius turpis tempor in. Mauris tellus arcu, egestas ut volutpat sit amet, mollis porttitor nibh. Pellentesque nec mauris dolor. Integer et placerat mi. Etiam tempus, enim in dapibus pellentesque, lectus tellus aliquam lacus, ut maximus felis ipsum vel eros. Nulla posuere imperdiet odio, nec fringilla magna. Sed rutrum, mi nec mollis ullamcorper, lorem tellus ultrices quam, sed dictum dui est vel dolor.
                </p>
              </div>
              <div className='signature-area p-4 flex flex-col gap-4 justify-center bg-gray-300 rounded-lg'>
                <h4 className='text-xl font-bold'>Signature Pad</h4>
                <Signature
                    ref={signatureRef}
                    value={[]}
                    width={580}
                    height={120}
                    instructions={"Please sign in the box above"}
                />
                <div className='flex gap-4'>
                  <button onClick={reset} className="btn btn-secondary">Clear Signature Pad</button>
                </div>
              </div>
              <button onClick={AddConsent} className="btn btn-primary">Sign Consent</button>
              <button onClick={closeModal} className="btn btn-secondary">Close</button>
            </div>
          )
      }
    </div>
  )

}

function MedicalRecordModal( {patientID, closeModal} ) {
  const { serverUrl } = useConfig();
  const [loading, setLoading] = useState(false)
  const [model, setModel] = useState({});
  const [checkBoxGroup, setCheckBoxGroup] = useState({});
  const [errors, setErrors] = useState({});
  
  const [checkedItems, setCheckedItems] = useState([]);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    setModel((prev) => ({
      ...prev,
      patientMedNfoHeight: convertToTotalFeet(prev.heightFeet, prev.heightInches),
    }));
  }, [model.heightFeet, model.heightInches]);

  const handleCheckboxChange = (item, isChecked) => {
    setCheckedItems((prev) =>
      isChecked ? [...prev, item] : prev.filter((i) => i !== item)
    );
  };

  useEffect(() => {    
    const joinedCheck = checkedItems?.join(', ')
    setCheckBoxGroup(`${joinedCheck}, ${inputValue}`);
  }, [checkedItems, inputValue])

  const validateModel = () => {
    const foundErrors = validateMedicalRecord(model);
    setErrors(foundErrors);
    return Object.keys(foundErrors).length === 0;
  };

  const AddMedRecord = () => {
    if (!serverUrl) return;
    if (!validateModel()) return;
    setLoading(true)
    
    const payload = {
      patientID:patientID,
      patientMedNfoHeight: model.patientMedNfoHeight,
      patientMedNfoWeight: model.patientMedNfoWeight,
      patientMedNfoAllergies: model.patientMedNfoAllergies,
      patientMedNfoMedications: model.patientMedNfoMedications,
      patientMedNfoComorbidities: checkBoxGroup,
      patientMedNfoHistory: model.patientMedNfoHistory,
      patientMedNfoImmunization: model.patientMedNfoImmunization,
      patientMedNfoFamilyHistory: model.patientMedNfoFamilyHistory,
      patientMedNfoCOVIDVaxx: model.patientMedNfoCOVIDVaxx
    }

    secureFetch(`${serverUrl}/patients-medical-info/record`, 
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(payload)
      })
      .then(async (response) => {
        const responseBody = await response.json()
        console.log(response)
        if(response.status !== 200) {
          console.log(responseBody);
          const errorString = responseBody.map((error) => error.message).join('\n');
          alert(errorString);
        } else {
          console.log(responseBody)
          alert(`Successfully added patient medical record for Patient No. ${patientID}`);
          closeModal();
        }
      })
      .catch(error => console.error(error)).
      finally(() => {
        setLoading(false)
      });

  }

  return (
    <div className='qe-modal-overlay'>   
      { loading ? (
          <span>Loading...</span>
          ) : (
            <div className="qe-modal gap-4 !w-full !max-w-2xl" style={{ display: 'flex' }}>   
              <h4 className="text-2xl mb-2 text-nowrap">Medical Record for Patient No. {patientID}</h4>
              
              <div className='flex gap-4'>
                <div className='w-full form-control'>
                  <label className="input-group w-full max-w-full">
                    <span className={"input-group-text font-bold uppercase text-nowrap " + 
                      (errors.patientMedNfoHeight && "text-error")
                    }>Height</span>
                    <div className='flex gap-2'>  

                      <input type="number" placeholder='feet' className={"!border-s !ms-2 input grow !text-black " + 
                        (errors.patientMedNfoHeight && "is-invalid text-error")
                      } value={model.heightFeet || ""} 
                      onChange={e => setModel((prev) => ({
                        ...prev,
                        heightFeet: e.target.value
                      }))}/>        

                      <input type="number" placeholder='inches' className={"!border-s input grow !text-black " + 
                        (errors.patientMedNfoHeight && "is-invalid text-error")
                      } value={model.heightInches || ""} 
                      onChange={e => setModel((prev) => ({
                        ...prev,
                        heightInches: e.target.value
                      }))}/>

                    </div>
                  </label>
                  {errors.patientMedNfoHeight && (
                    <div className="label">
                      <span className="label-text-alt text-error">{errors.patientMedNfoHeight}</span>
                    </div>
                    )} 
                </div>
                
                <div className='w-full form-control'>
                  <label className="input-group w-full max-w-full">
                    <span className={"input-group-text font-bold uppercase text-nowrap " + 
                      (errors.patientMedNfoWeight && "text-error")
                    }>Weight (kg)</span>
                    <input type="number" className={"input grow !text-black " + 
                      (errors.patientMedNfoWeight && "is-invalid text-error")
                    } value={model.patientMedNfoWeight || ""} 
                    onChange={e => setModel((prev) => ({
                      ...prev,
                      patientMedNfoWeight: e.target.value
                    }))}/>
                  </label>
                  {errors.patientMedNfoWeight && (
                    <div className="label">
                      <span className="label-text-alt text-error">{errors.patientMedNfoWeight}</span>
                    </div>
                    )} 
                </div>
              </div>
                    
              <div className='w-full form-control'>
                <label className="input-group w-full max-w-full">
                  <span className="input-group-text font-bold uppercase text-nowrap ">Allergies</span>
                  <textarea className="textarea grow !text-black " value={model.patientMedNfoAllergies || ""} 
                  onChange={e => setModel((prev) => ({
                    ...prev,
                    patientMedNfoAllergies: e.target.value
                  }))}/>
                </label>
              </div>
                    
              <div className='w-full form-control'>
                <label className="input-group w-full max-w-full">
                  <span className="input-group-text font-bold uppercase text-nowrap ">
                    Medications
                  </span>
                  <textarea className="textarea grow !text-black " value={model.patientMedNfoMedications || ""} 
                  onChange={e => setModel((prev) => ({
                    ...prev,
                    patientMedNfoMedications: e.target.value
                  }))}/>
                </label>
              </div>

              <h4 className="text-xl font-bold uppercase">Comorbidities</h4>
              <div className='grid grid-cols-2 gap-4'>
                <CheckboxGroup
                  options={['Heart disease', 
                            'High blood pressure', 
                            'Lung disease', 
                            'Diabetes', 
                            'Kidney disease',
                            'Stroke',
                            'Anemia']}
                  groupTitle=""
                  onChange={handleCheckboxChange}
                />
                <CheckboxGroup
                  options={['Obesity', 
                            'Dementia', 
                            'Hepatitis', 
                            'Arthritis', 
                            'Stomach disease', 
                            'Liver disease',
                            'Depression']}
                  groupTitle=""
                  onChange={handleCheckboxChange}
                />

                <div className='w-full form-control col-span-2'>
                  <label className="input-group w-full max-w-full">
                    <span className="input-group-text font-bold uppercase text-nowrap ">Other Comorbidities</span>
                    <input type='text' className="input grow !text-black " value={inputValue || ""}
                    onChange={e => setInputValue(e.target.value)} />
                  </label>
                </div>
              </div>
                    
              <div className='w-full form-control'>
                <label className="input-group w-full max-w-full">
                  <span className="input-group-text font-bold uppercase text-nowrap ">
                    Medical History
                  </span>
                  <textarea className="textarea grow !text-black " value={model.patientMedNfoHistory || ""} 
                  onChange={e => setModel((prev) => ({
                    ...prev,
                    patientMedNfoHistory: e.target.value
                  }))}/>
                </label>
                <div className="label">
                  <span className="label-text-alt"></span>
                  <span className="label-text-alt">Hospitalizations, Therapies, Treatments, etc.</span>
                </div>
              </div>
                    
              <div className='w-full form-control'>
                <label className="input-group w-full max-w-full">
                  <span className="input-group-text font-bold uppercase text-nowrap ">
                    Immunization
                  </span>
                  <textarea className="textarea grow !text-black " value={model.patientMedNfoImmunization || ""} 
                  onChange={e => setModel((prev) => ({
                    ...prev,
                    patientMedNfoImmunization: e.target.value
                  }))}/>
                </label>
              </div>
                    
              <div className='w-full form-control'>
                <label className="input-group w-full max-w-full">
                  <span className="input-group-text font-bold uppercase text-nowrap ">
                    Family Medical History
                  </span>
                  <textarea className="textarea grow !text-black " value={model.patientMedNfoFamilyHistory || ""} 
                  onChange={e => setModel((prev) => ({
                    ...prev,
                    patientMedNfoFamilyHistory: e.target.value
                  }))}/>
                </label>
              </div>
                
              <div className='w-full form-control'>
                <label className="input-group w-full max-w-full">
                  <span className={"input-group-text font-bold uppercase text-nowrap " + 
                    (errors.patientMedNfoCOVIDVaxx && "text-error")
                  }>COVID-19 Vaccinations</span>
                  <textarea className={"textarea grow !text-black " + 
                    (errors.patientMedNfoCOVIDVaxx && "is-invalid text-error")
                  } value={model.patientMedNfoCOVIDVaxx || ""} 
                  onChange={e => setModel((prev) => ({
                    ...prev,
                    patientMedNfoCOVIDVaxx: e.target.value
                  }))}/>
                </label>
                {errors.patientMedNfoCOVIDVaxx && (
                  <div className="label">
                    <span className="label-text-alt text-error">{errors.patientMedNfoCOVIDVaxx}</span>
                  </div>
                  )} 
                </div>
                <button onClick={AddMedRecord} className="btn btn-secondary">Add Medical Record</button>  
              <button onClick={closeModal} className="btn btn-secondary">Close</button>
            </div>
          )
      }
    </div>
  )

}
  
function validateNewAdmissionModel(model) {
  const foundErrors = {};
  if (!model.patientName) {
    foundErrors.patientName = 'Name is required. If unknown, use descriptive name';
  } 
  if (!model.patientTriage) {
    foundErrors.patientTriage = 'Triage is required';
  } 
  if (!model.patientERCause) {
    foundErrors.patientERCause = 'Cause of admission is required';
  } 
  return foundErrors;
}

function validateAdmissionModel(model) {
  const foundErrors = {};
  console.log(model)
  if (!model.patientName) {
    foundErrors.patientName = 'Name is required';
  } 
  if (!model.patientTriage) {
    foundErrors.patientTriage = 'Triage is required';
  } 
  if (!model.patientStatus) {
    foundErrors.patientStatus = 'Status is required';
  } 
  if (!model.patientBedLocCode) {
    foundErrors.patientBedLocCode = 'Bed Location Code is required';
  } 
  if (!model.patientERCause) {
    foundErrors.patientERCause = 'Cause of admission is required';
  } 
  return foundErrors;
}

function validatePatientModel(model) {
  const foundErrors = {};
  if (!model.patientFullName) {
    foundErrors.patientFullName = 'Name is required';
  }
  if (!model.patientGender) {
    foundErrors.patientGender = 'Gender is required';
  }
  return foundErrors;
}

function validateMedicalRecord(model) {
  const foundErrors = {};
  if (!model.patientMedNfoHeight) {
    foundErrors.patientMedNfoHeight = 'Height is required';
  } 
  if (!model.patientMedNfoWeight) {
    foundErrors.patientMedNfoWeight = 'Weight is required';
  } 
  if (!model.patientMedNfoCOVIDVaxx) {
    foundErrors.patientMedNfoCOVIDVaxx = 'COVID-19 Vaccination Info is required. Write NONE if no vaccination.';
  } 
  return foundErrors;
}

function Sidebar() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false); // State for modal visibility
  const { user, loading  } = useUser();
  const [isUserLoaded, setIsUserLoaded] = useState(false);

  useEffect(() => {
    if (user || loading === false) {
      setIsUserLoaded(true);
    }
  }, [user, loading]);

  if (loading || !isUserLoaded) {
    return <div>Loading...</div>; 
  }

  const handleLogout = () => {
    setShowModal(false); // Close modal
    window.location.href = '/logout'; // Navigate to the login page
  };
// Sidebar Component
return (
  <div className="emergency-room-container">
    <aside className="sidebar">
    <img src={quicker} onClick={() => navigate('/menu')} alt="Quicker Logo" className="logo cursor-pointer" />
      <ul className="nav-menu">
        {(user.role == "ADMIN" || user.role == "STAFF") &&
          <li className="nav-menu-item active" onClick={() => navigate('/emergency')}>Emergency Room</li>
        }
        {(user.role == "ADMIN" || user.role == "INVENTORYSTAFF") &&
          <li className="nav-menu-item" onClick={() => navigate('/inventory')}>Inventory</li>
        }
        {(user.role == "ADMIN" || user.role == "INVENTORYSTAFF") &&
          <li className="nav-menu-item" onClick={() => navigate('/beds')}>Bed Management</li>
        }        
        {(user.role == "ADMIN" || user.role == "STAFF") &&
          <li className="nav-menu-item" onClick={() => navigate('/billing')}>Billing</li>
        }
        <li className="nav-menu-item" onClick={() => setShowModal(true)}>Log-out</li>
      </ul>

      {/* Log-out Confirmation Modal */}
      {showModal && (
        <div className="qe-modal-overlay">
          <div className="qe-modal !w-auto flex flex-col gap-4">
            <h4 className="text-2xl">Confirm Log-out</h4>
            <p>Are you sure you want to log out?</p>
            <div className="flex gap-4 justify-end">              
              <button onClick={() => setShowModal(false)} className="btn">Cancel</button>
              <button onClick={handleLogout} className="btn">Yes</button>
            </div>
          </div>
        </div>
      )}
    </aside>
  </div>
);
}
  
const formateDateForInputDateTime  = (dateStr) => {
  if (dateStr == null) return null;
  const [yyyy,mm,dd,hh,mi] = dateStr.split(/[/:\-T]/);
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`; 
};

const formatDateForInputDate = (dateStr) => { 
  if (dateStr == null) return null;
  const [yyyy, mm, dd] = dateStr.split(/[/:\-T]/);
  return `${yyyy}-${mm}-${dd}`; 
};

const formateDateForString = (dateStr) => {
  const date = new Date(dateStr);
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
  return formattedDate;
}

const ensureDateIsInstantSerializable = (dateStr) => {
  if (!dateStr) return null;
   // Check if the date is already in the format "YYYY-MM-DDTHH:mm:ssZ"
   const isoInstantRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
   if (isoInstantRegex.test(dateStr)) {
     return dateStr;
   }
  return `${dateStr}T00:00:00Z`;
}

const truncateLongStr = (str, n) => {
  return (str.length > n) ? str.slice(0, n-1) + "\u2026" : str;
}

const isPatientOutOfER = (status) => {
  return status === "paid" || status === "collateralized" || 
         status === "discharged" || status === "admitted-to-ward" || status?.includes("transferred");
}

const convertToTotalFeet = (ft, inches) => {
  return ft + inches / 12;
}

const extractFeetAndInches = (totFt) => {
  let feet = Math.floor(totFt);  
  let inches = Math.round((totFt - feet) * 12);  
  return { feet, inches };
}

// App Component (Main Entry Point)
function App() {
  const [modalVisible, setModalVisible] = useState(false);
  const [assignPatientIDModalVisible, setAssignPatientIDModalVisible] = useState(false);
  const [patientIDModalVisible, setPatientIDModalVisible] = useState(false);
  const [newPatientModalVisible, setNewPatientModalVisible] = useState(false);
  const [consentModalVisible, setConsentModalVisible] = useState(false);
  const [medicalRecordModalVisible, setMedicalRecordModalVisible] = useState(false);
  const [admissionInfoModalVisible, setAdmissionInfoModalVisible] = useState(false);
  const [currentItemID, setCurrentItemID] = useState(null);
  const [patientID, setPatientID] = useState(null);
  
  const { serverUrl } = useConfig();
  const [patientAdmissions, setPatientAdmissions] = useState({});
  const [query, setQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [loading, setLoading] = useState(false);

  const FetchPatientAdmissions = () => {
    if (!serverUrl) return;
    setLoading(true)
    secureFetch(`${serverUrl}/patient-admissions/search?` + new URLSearchParams({
      query: query,
      page: currentPage,
      size: itemsPerPage
    }).toString(), 
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: 'include',
    })
    .then(response => response.json())
    .then(data => {
      setPatientAdmissions(data)
      console.log(data)
    })
    .catch(error => console.error(error)).
    finally(() => {
      setLoading(false)
    })
  }
  
  useEffect(() => {
    FetchPatientAdmissions();
  }, [query, currentPage, itemsPerPage, serverUrl]);

  const showUpdateModal = (item) => {
    console.log('showUpdateModal', item);
    setCurrentItemID(item);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const showAssignPatientIDModal = (item) => {
    console.log('showAssignPatientIDModal', item);
    setCurrentItemID(item);
    setAssignPatientIDModalVisible(true);
    closeModal();
  };

  const closeAssignPatientIDModal = () => {
    setAssignPatientIDModalVisible(false);
  };

  const showPatientIDModal = (item) => {
    console.log('showPatientIDModal', item);
    setPatientID(item);
    setPatientIDModalVisible(true);
    closeAssignPatientIDModal();
  }

  const closePatientIDModal = () => {
    setPatientIDModalVisible(false);
  }

  const showNewPatientModal = (item) => {
    console.log('showNewPatientModal', item);
    setCurrentItemID(item);
    setNewPatientModalVisible(true);
    closeAssignPatientIDModal();
  }

  const closeNewPatientIDModal = () => {
    setNewPatientModalVisible(false);
  }

  const showConsentModal = (item) => {
    console.log('showConsentModal', item);
    setCurrentItemID(item);
    setConsentModalVisible(true);
    closeModal();
  }

  const closeConsentModal = () => {
    setConsentModalVisible(false);
  }

  const showMedicalRecordModal = (item) => {
    console.log('showMedicalRecordModal', item);
    setCurrentItemID(item);
    setMedicalRecordModalVisible(true);
    closeModal();
  }

  const closeMedicalRecordModal = () => {
    setMedicalRecordModalVisible(false);
  }

  const showAdmissionInfoModal = (item) => {
    console.log('showAdmissionInfoModal', item);
    setCurrentItemID(item);
    setAdmissionInfoModalVisible(true);
  }

  const closeAdmissionInfoModal = () => {
    setAdmissionInfoModalVisible(false);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'row', height: '100vh', position: 'relative' }}>
      <Sidebar />
      <div className="main-container">
        <div className="content-container">
          {/* Inventory */}
          <Admissions
            showUpdateModal={showUpdateModal}
            showAdmissionInfoModal={showAdmissionInfoModal}
            patientAdmissions={patientAdmissions}
            loading={loading}
            FetchPatientAdmissions={FetchPatientAdmissions}
            setQuery={setQuery}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            itemsPerPage={itemsPerPage}
          />
        </div>

        {/* Add Item Below Inventory */}
        <AddItem          
          refreshAdmissions={FetchPatientAdmissions} />
      </div>

      {/* Modal for Quantity Input */}
      {modalVisible && (currentItemID !== null) && (
        <Modal
          id={currentItemID}
          closeModal={closeModal}
          refreshTable={FetchPatientAdmissions}
          showAssignPatientIDModal={showAssignPatientIDModal}
          showConsentModal={showConsentModal}
          showMedicalRecordModal={showMedicalRecordModal}
        />
      )}

      {/* Modal for Assign Patient ID */}
      {assignPatientIDModalVisible && (currentItemID !== null) && (
        <AssignPatientIDModal
          admissionID={currentItemID}
          closeModal={closeAssignPatientIDModal}
          refreshTable={FetchPatientAdmissions}
          showAssignPatientIDModal={showPatientIDModal}
          showNewPatientModal={showNewPatientModal}
        />
      )}

      {/* Modal for Patient ID */}
      {patientIDModalVisible && (currentItemID !== null) && (patientID !== null) && (
        <PatientRecordModal
          admissionID={currentItemID}
          patientID={patientID}
          closeModal={closePatientIDModal}
        />
      )}
      
      {/* Modal for New Patient */}
      {newPatientModalVisible && (currentItemID !== null) && (
        <NewPatientModal           
          admissionID={currentItemID}
          closeModal={closeNewPatientIDModal}
        />
      )}

      {/* Modal for Informed Consent */}
      {consentModalVisible && (currentItemID !== null) && (
        <ConsentModal
          admissionID={currentItemID}
          closeModal={closeConsentModal}
        />
      )}

      {/* Modal for Medical Record */}
      {medicalRecordModalVisible && (currentItemID !== null) && (
        <MedicalRecordModal
          patientID={currentItemID}
          closeModal={closeMedicalRecordModal}
        />
      )}

      {/* Modal for Admission Info */}
      {admissionInfoModalVisible && (currentItemID !== null) && (
        <AdmissionInfo
          admissionID={currentItemID}
          closeModal={closeAdmissionInfoModal}
        />
      )}
    </div>
  );
};

export default App;
