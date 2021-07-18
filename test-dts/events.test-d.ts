import { InputEvent, expectType } from './index'

declare const inputEvent: InputEvent<HTMLInputElement>
expectType<string>(inputEvent.target.value)
