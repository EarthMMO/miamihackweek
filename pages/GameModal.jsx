import React from 'react';

const GameModal = () => {
  return (
    <div>
      <div className='fixed top-0 left-0 w-full h-full backdrop-blur-sm z-10'></div>
      <div className='absolute w-96 h-80 top-1/2 left-1/2 translate-x-1/2 translate-y-1/2 text-[#3D405B] drop-shadow-2xl z-20  rounded-lg bg-white '>
        <button className='h-fit w-8 text-[#3D405B] float-right text-3xl hover:text-[#E07A5F] rounded-lg' onClick={(e)=>closeModal(e)}>&times;</button>
        <form className='h-80 w-80 flex flex-col items-center justify-center m-auto p-1' >
          <h2 className='max-w-max p-2 mb-4 text-3xl'>Enter Game Code:</h2>
          <input className='mb-4 rounded-sm text-[#3D405B] text-3xl text-center' type='text' />
          <button type='submit'>Join</button>
        </form>
      </div>
    </div>
  )
}

export default GameModal;