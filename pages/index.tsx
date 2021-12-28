import type { NextPage } from 'next';
import Head from 'next/head';
import { createRef, LegacyRef, useEffect, useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import Swal from 'sweetalert2'
import styles from '../styles/Home.module.css';
import Link from 'next/link';
import { strToBool } from '../utils/stringToBool';
import hyttpo from 'hyttpo';

const Home: NextPage = () => {
  const recaptchaRef: LegacyRef<ReCAPTCHA> = createRef();
  const [fileName, setFileName] = useState('Nothing');

  const [infoAlert, setInfoAlert]: any = useState({ nothing: true });

  useEffect(() => {
    const $recaptcha = document.querySelector('#g-recaptcha-response');
    if($recaptcha) $recaptcha.setAttribute('required', 'required');
  })

  const formatBytes = (bytes: number, decimals?: number) => {
    if (!decimals) decimals = 2;
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  const clearForm = () => {
    const fileUploadForm: any = document.getElementById('fileUploadForm');

    recaptchaRef.current?.reset();
    fileUploadForm?.reset();
    setFileName('Nothing');
  }

  const handleSubmit = async(event: any) => {
    event.preventDefault();

    if (recaptchaRef.current?.getValue()?.length === 0) return;
  
    let result;
    if (strToBool(process.env.NEXT_PUBLIC_AUTHORIZATION)) {
      result = await Swal.fire({
        title: 'Your Authorization Token',
        input: 'password',
        inputAttributes: {
          autocapitalize: 'off'
        },
        showCancelButton: true,
        confirmButtonText: 'Submit',
        showLoaderOnConfirm: true,
        allowOutsideClick: () => !Swal.isLoading()
      })
    } else result = null;

    if ((result.isDenied) || (result.isDismissed)) {
      clearForm();

      setInfoAlert({
        message: 'Error: Invalid authorization token! (403)'
      })

      return;
    } 

    const ToSCheckBox: any = document.getElementById('tosCheckbox');
    const checkbox: any = document.getElementById('withoutAuth');
    const form = new FormData();

    let file: any = document.getElementById('fileInput');
    file = file?.files?.[0] || file;

    if (file.size > 1000000000) return setInfoAlert({ message: 'Maximum allowed size is 1GB' });

    form.append('file', file);
    form.append('gcaptcha', recaptchaRef.current?.getValue() || 'none');
    form.append('tos-accept', ToSCheckBox.checked);

    if (checkbox) form.append('withoutAuth', checkbox.checked);

    recaptchaRef.current?.reset();

    const res = await hyttpo.request({
      method: 'POST',
      url: window.location + '/api/uploadFile',
      body: form,
      headers: {
        'Authorization': result?.value
      },
      onUploadProgress: (p) => {
        setInfoAlert({ 
          message: `${formatBytes(p.loaded)} / ${formatBytes(p.total)}`
        });
      }
    }).catch(e => e)

    if (res.data?.message?.path) setInfoAlert({
      url: `${window.location}api/files?id=${res.data.message.path}${result?.value && !checkbox.checked ? `&token=${result.value}` : ''}`,
      previewUrl: `${res.data.message.url}`,
      deleteUrl: `${window.location}api/files?id=${res.data.message.path}&del=true${result?.value ? `&token=${result.value}` : ''}`
    });
    else setInfoAlert({ message: `Error: ${res.data.message} (${res.status})` })

    clearForm();

    return;
  }

  const changeInput = (obj: any) => {
    const name = obj.target.files[0].name;
    setFileName(name);
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Muploader</title>
        <meta name='description' content='Muploader | Easy to share files' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <main>
        <h1 className='title'>
          Easy to share files!
        </h1>

        { !infoAlert.nothing ? <div className='notification is-primary is-light'>
          { infoAlert.url ? 
          <><Link href={infoAlert.url}><a>Download: {infoAlert.url}</a></Link><br /><Link href={infoAlert.previewUrl}><a>Preview: {infoAlert.previewUrl}</a></Link><br /><Link href={infoAlert.deleteUrl}><a>Delete: {infoAlert.deleteUrl}</a></Link></>
          : infoAlert.message }
        </div> : '' } 

        <form className='box' onSubmit={handleSubmit} id='fileUploadForm'>
          <div className='field file is-boxed is-fullwidth'>
            <label className='file-label'>
              <input className='file-input' onChange={changeInput} type='file' name='resume' id='fileInput' required/>
              <span className='file-cta'>
                <span className='file-icon'>
                  <i className='fas fa-upload'></i>
                </span>
                <span className='file-label'>
                  Choose a file…
                </span>
              </span>
              <span className='file-name'>
                { fileName }
              </span>
            </label>
          </div>

          <div className='field is-boxed'>
            <ReCAPTCHA
              ref={recaptchaRef}
              size='normal'
              sitekey={process.env.NEXT_PUBLIC_SITE_KEY}
	          />
          </div>

          { strToBool(process.env.NEXT_PUBLIC_AUTHORIZATION)
          ? <>
            <div className='field control checkbox is-checkbox'>
              <label className='checkbox'>
                <input type='checkbox' id='withoutAuth'/>
                See file without authorization
              </label>
            </div>
            <br />
          </> :
          <></> 
          }

          <div className='field control checkbox is-checkbox'>
            <label className='checkbox'>
              <input type='checkbox' id='tosCheckbox' />
              I agree to the <a href='/tos'>terms and services</a>
            </label>
          </div>

          <div className='field control has-text-centered'>
            <button className='button is-primary' type='submit'>Submit</button>
          </div>
        </form>
      </main>
    </div>
  )
}

export default Home;