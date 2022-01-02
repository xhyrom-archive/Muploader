import type { NextPage } from 'next';
import Head from 'next/head';
import { useState } from 'react';
import { RecaptchaComponent } from '../components/recaptcha';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import Swal from 'sweetalert2';
import Link from 'next/link';
import { ProgressBar } from 'react-bootstrap';
import { strToBool } from '../utils/stringToBool';
import hyttpo from 'hyttpo';

const Home: NextPage = () => {
	const { executeRecaptcha } = useGoogleReCaptcha();

	const [fileName, setFileName] = useState('Nothing');
	const [infoAlert, setInfoAlert]: any = useState({ nothing: true });

	const formatBytes = (bytes: number, decimals?: number) => {
		if (!decimals) decimals = 2;
		if (bytes === 0) return '0 Bytes';

		const k = 1024;
		const dm = decimals < 0 ? 0 : decimals;
		const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

		const i = Math.floor(Math.log(bytes) / Math.log(k));

		return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
	};

	const clearForm = () => {
		const fileUploadForm: any = document.getElementById('fileUploadForm');

		fileUploadForm?.reset();
		setFileName('Nothing');
	};

	const handleSubmit = async(event: any) => {
		event.preventDefault();

		const recaptchaToken = await executeRecaptcha('upload');
  
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
			});
		} else result = null;

		if ((result.isDenied) || (result.isDismissed)) {
			clearForm();

			setInfoAlert({
				message: 'Error: Invalid authorization token! (403)'
			});

			return;
		}

		let file: any = document.getElementById('fileInput');
		file = file?.files?.[0] || file;

		if (file.size > 1000000000) return setInfoAlert({ message: 'Maximum allowed size is 1GB' });

		const captchaRes = await hyttpo.request({
			method: 'POST',
			url: window.location + 'api/captcha',
			body: JSON.stringify({
				gcaptcha: recaptchaToken || 'none'
			}),
			headers: {
				'Authorization': result?.value
			}
		}).catch(e => e);

		console.log(captchaRes)

		const ToSCheckBox: any = document.getElementById('tosCheckbox');
		const checkbox: any = document.getElementById('withoutAuth');
		const form = new FormData();

		form.append('file', file);
		form.append('gcaptcha', captchaRes.data.message || 'none');
		form.append('tos-accept', ToSCheckBox.checked);

		if (checkbox) form.append('withoutAuth', checkbox.checked);

		const res = await hyttpo.request({
			method: 'POST',
			url: window.location + 'api/uploadFile',
			body: form,
			headers: {
				'Authorization': result?.value
			},
			onUploadProgress: (p) => {
				const percentage = Math.floor( (p.loaded * 100) / p.total );

				setInfoAlert({
					percentage,
					message: `${formatBytes(p.loaded)} / ${formatBytes(p.total)}`
				});
			}
		}).catch(e => e);

		if (res.data?.message?.path) setInfoAlert({
			url: `${res.data.message.url}`,
			downloadUrl: `${res.data.message.downloadUrl}`,
			deleteUrl: `${res.data.message.deleteUrl}`
		});
		else setInfoAlert({ message: `Error: ${res.data.message} (${res.status})` });

		clearForm();

		return;
	};

	const changeInput = (obj: any) => {
		const name = obj.target.files[0].name;
		setFileName(`${name.slice(0, 20)}${name.length > 20 ? '...' : ''}`);
	};

	return (
		<div>
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
						<>
							<Link href={infoAlert.url}><a target={'_blank'}>Preview: {infoAlert.url}</a></Link>
							<br />
							<Link href={infoAlert.downloadUrl}><a target={'_blank'}>Download: {infoAlert.downloadUrl}</a></Link>
							<br />
							<Link href={infoAlert.deleteUrl}><a target={'_blank'}>Delete: {infoAlert.deleteUrl}</a></Link>
						</>
						: infoAlert.percentage ?
							<>
								{infoAlert.message}
								<ProgressBar now={infoAlert.percentage} variant='info' label={`${infoAlert.percentage}%`} />
							</>
							:
							infoAlert.message
					}
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
              I agree to the <Link href='/tos'><a>terms and services</a></Link>
						</label>
					</div>

					<div className='field control has-text-centered'>
						<button className='button is-primary' type='submit'>Submit</button>
					</div>
				</form>
			</main>
		</div>
	);
};

export default RecaptchaComponent(Home);