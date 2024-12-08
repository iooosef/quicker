import React, { useEffect, useState } from 'react';
import './inventory.css'; 
import quicker from "./assets/quicker.png";
import { useNavigate } from 'react-router-dom';
import { useConfig } from './util/ConfigContext';
import { useUser } from './auth/UserContext';
import secureFetch from './auth/SecureFetch';

function AddItem({ refreshAdmissions }) {
  const { serverUrl } = useConfig();
  const [loading, setLoading] = useState(false);
  const [isSupplyQty, setIsSupplyQty] = useState('');
  const [errors, setErrors] = useState({});

  const validateModel = (supply) => {
    const foundErrors = validateAdmissionModel(supply);
    setErrors(foundErrors);
    return Object.keys(foundErrors).length === 0;
  };

  const AddSupply = (e) => {
    e.preventDefault();

    if (!serverUrl) return;

    const formData = new FormData(e.target);
    const supply = {
      supplyName: formData.get("supplyName"),
      supplyType: formData.get("supplyType"),
      supplyQty: formData.get("supplyQty"),
      supplyPrice: formData.get("supplyPrice"),
    };

    console.log(supply)
    if (!validateModel(supply)) return;
    setLoading(true)

    const payload = {
      supplyName: supply.supplyName,
      supplyType: supply.supplyType,
      supplyQty: supply.supplyQty,
      supplyPrice: supply.supplyPrice
    };

    secureFetch(`${serverUrl}/supplies/supply`, 
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
        alert(`Successfully added ${supply.supplyQty}pcs ` + 
              `of ${supply.supplyName} ` + 
              ` (${supply.supplyType}) ` + 
              `for ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PHP' }).format(supply.supplyPrice)} each.`);
        refreshAdmissions();
        e.target.reset();
      }
    })
    .catch(error => console.error(error)).finally(() => {
      setLoading(false)
    })
  }

  return (
    <div className="add-item-container">
      <h4 className="text-2xl mb-2">Add Item to Inventory</h4>
      {/* {errors && <p className="error-message">{errors}</p>} */}
      <form onSubmit={AddSupply}>
        <div className="table-container">
          <table>
            <tbody>
              <tr className='flex gap-2 pt-2'>
                
                <td className='flex-1'>                  
                  <label>
                    <div className="label hidden">
                      <span className="label-text-alt"></span>
                    </div>
                    <div className="form-control">
                      <input type="text" name='supplyName' placeholder='' 
                        className={"input input-floating peer " + 
                          (errors.supplyName && "is-invalid")} />
                      <span className="input-floating-label">Name</span>
                    </div>
                    <div className="label">
                      {errors.supplyName && (
                        <span className="label-text-alt">{errors.supplyName}</span>
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
                      <input type="text" name='supplyType' list='typeOptions' placeholder='' 
                        className={"input input-floating peer " + 
                          (errors.supplyType && "is-invalid")}
                          onChange={(e) => {
                            const isSupply = e.target.value.includes("supply:");
                            if (!isSupply) {
                              setIsSupplyQty(-1)
                            } else {
                              setIsSupplyQty('')
                            }
                          }} />
                      <datalist id="typeOptions">
                        <option value="test:Laboratory"></option>
                        <option value="test:Imaging"></option>
                        <option value="test:Diagnostic"></option>
                        <option value="treatment:Treatment"></option>
                        <option value="supply:Respiratory"></option>
                        <option value="supply:Wound_Care"></option>
                        <option value="supply:IV"></option>
                        <option value="supply:Medication"></option>
                        <option value="supply:Monitoring"></option>
                        <option value="supply:Diagnostic"></option>
                        <option value="supply:Resuscitation"></option>
                        <option value="supply:PPE"></option>
                        <option value="supply:Orthopedic"></option>
                        <option value="supply:PatientTransport"></option>
                        <option value="supply:Surgical"></option>
                        <option value="supply:Miscellaneous"></option>
                      </datalist>
                      <span className="input-floating-label">Type</span>
                    </div>
                    <div className="label">
                      {errors.supplyType && (
                        <span className="label-text-alt">{errors.supplyType}</span>
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
                      <input type="number" name='supplyQty' placeholder='' 
                        className={"input input-floating peer " + 
                          (errors.supplyQty && "is-invalid")} 
                          value={isSupplyQty}
                          onChange={e => setIsSupplyQty(e.target.value)}
                          disabled={isSupplyQty === -1} />
                      <span className="input-floating-label">Quantity</span>
                    </div>
                    <div className="label">
                      {errors.supplyQty && (
                        <span className="label-text-alt">{errors.supplyQty}</span>
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
                      <input type="number" name='supplyPrice' placeholder='' 
                        className={"input input-floating peer " + 
                          (errors.supplyPrice && "is-invalid")} />
                      <span className="input-floating-label">Price</span>
                    </div>
                    <div className="label">
                      {errors.supplyPrice && (
                        <span className="label-text-alt">{errors.supplyPrice}</span>
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
      

      {/* Inventory Table */}
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
                <td className='text-black flex justify-center'>
                  <button type="button" onClick={() => showUpdateModal(item.id)} className='btn btn-soft btn-secondary !p-2 min-h-fit !h-fit'>
                    <span className="icon-[tabler--pencil] text-neutral-500"></span>
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

function Modal({ id, closeModal, refreshTable, showAssignPatientIDModal }) {
  const { serverUrl } = useConfig();
  const [loading, setLoading] = useState(false)
  const [model, setModel] = useState({});
  const [errors, setErrors] = useState({});

  const validateModel = () => {
    const foundErrors = validateAdmissionModel(model);
    setErrors(foundErrors);
    return Object.keys(foundErrors).length === 0;
  };

  const FetchTable = () => {
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

  useEffect(() => {
    FetchTable();
  }, [id]);

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
              {
                !model.patientID &&
                <button onClick={() => showAssignPatientIDModal(model.id)} className="btn btn-primary">Assign Patient ID</button>
              }
              {
                !isPatientOutOfER(model.patientStatus) &&
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
  console.log(patientID)

  const FetchTable = () => {
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
    FetchTable();
  }, [patientID]);

  return (
    <div className='qe-modal-overlay'>   
      { loading ? (
          <span>Loading...</span>
          ) : (
            <div className="qe-modal gap-4 !w-fit !max-w-fit" style={{ display: 'flex' }}>   
              <h4 className="text-2xl mb-2">Patient No. {patientID}</h4>

              <label className="input-group w-full max-w-full">
                <span className="input-group-text font-bold uppercase text-nowrap">Full Name</span>
                <input type="text" className="input grow !text-black" value={model.patientFullName || ""} 
                onChange={e => setModel((prev) => ({
                  ...prev,
                  patientFullName: e.target.value
                }))}/>
              </label>
              
              <div className='w-full gap-4 flex'>
                <label className="input-group w-full max-w-full">
                  <span className="input-group-text font-bold uppercase text-nowrap">Gender</span>
                  <input type="text" className="input grow !text-black" value={model.patientGender || ""} 
                  onChange={e => setModel((prev) => ({
                    ...prev,
                    patientGender: e.target.value
                  }))}/>
                </label>

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

function AssignPatientIDModal( {admissionID, closeModal, refreshTable, showAssignPatientIDModal} ) {
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
            <button className="btn btn-primary">No Record Found? Create New One</button>
          <button onClick={closeModal} className="btn btn-secondary">Close</button>
        </div>
      )
    }
    </div>
  )
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

// App Component (Main Entry Point)
function App() {
  const [modalVisible, setModalVisible] = useState(false);
  const [assignPatientIDModalVisible, setAssignPatientIDModalVisible] = useState(false);
  const [patientIDModalVisible, setPatientIDModalVisible] = useState(false);
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
    console.log('showAssignPatientIDModal', item);
    setPatientID(item);
    setPatientIDModalVisible(true);
    closeAssignPatientIDModal();
  }

  const closePatientIDModal = () => {
    setPatientIDModalVisible(false);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'row', height: '100vh', position: 'relative' }}>
      <Sidebar />
      <div className="main-container">
        <div className="content-container">
          {/* Inventory */}
          <Admissions
            showUpdateModal={showUpdateModal}
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
        />
      )}

      {/* Modal for Assign Patient ID */}
      {assignPatientIDModalVisible && (currentItemID !== null) && (
        <AssignPatientIDModal
          admissionID={currentItemID}
          closeModal={closeAssignPatientIDModal}
          refreshTable={FetchPatientAdmissions}
          showAssignPatientIDModal={showPatientIDModal}
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
      

    </div>
  );
};

export default App;
