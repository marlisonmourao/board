import { ProductHeader } from '@/components/header/product-header'
import { Suspense } from 'react'
import { CreateIssueDialog } from '../create-issue-dialog'
import { SearchInput } from './search-input'

export function Header() {
  return (
    <ProductHeader isBoard>
      <Suspense>
        <SearchInput />
      </Suspense>
      <CreateIssueDialog />
    </ProductHeader>
  )
}
