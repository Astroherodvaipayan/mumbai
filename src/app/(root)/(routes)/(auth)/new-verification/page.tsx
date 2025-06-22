'use client'

import { CardWrapper } from '@/components/auth/card-wrapper'
import { newVerification } from '@/actions/new-verification'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

export default function NewVerificationForm() {
  const [error, setError] = useState<string | undefined>()
  const [hasErrorToastShown, setHasErrorToastShown] = useState<boolean>(false)

  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const router = useRouter()

  const onSubmit = useCallback(() => {
    if (!token) {
      toast.error('No token provided')
      return
    }
    newVerification(token)
      .then((data) => {
        if (data?.error) {
          setTimeout(() => {
            setError(data.error)
          }, 500)
        }
        // Note: newVerification in demo mode only returns error, no success case
      })
      .catch(() => {
        const errorMessage = 'Something went wrong'
        setError(errorMessage)
      })
  }, [token, router])

  useEffect(() => {
    onSubmit()
  }, [onSubmit])

  useEffect(() => {
    if (error && !hasErrorToastShown) {
      const timer = setTimeout(() => {
        toast.error(error)
        setHasErrorToastShown(true)
        // Redirect to login after showing error
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [error, hasErrorToastShown, router])

  return (
    <CardWrapper
      headerTitle="Verify your email"
      backButtonLabel="Back to Login"
      backButtonHref="/login"
    >
      <div className="flex items-center w-full justify-center">
        {!error && <p>Verifying...</p>}
      </div>
    </CardWrapper>
  )
}
